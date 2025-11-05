<?php

namespace App\Services;

use GuzzleHttp\Client;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RagEngineService
{
    protected $projectId;
    protected $location;
    protected $corpusId;
    protected $corpusName;
    protected $model;
    protected $httpClient;
    protected $credentialsPath;

    public function __construct()
    {
        $this->projectId = config('services.rag_engine.project_id');
        $this->location = config('services.rag_engine.location');
        $this->corpusId = config('services.rag_engine.corpus_id');
        $this->corpusName = config('services.rag_engine.corpus_name');
        $this->model = config('services.rag_engine.model', 'gemini-2.0-flash-001');
        $this->credentialsPath = config('services.rag_engine.credentials');
        $this->httpClient = new Client(['timeout' => 60]);
    }

    /**
     * Get access token using service account (cached for 50 minutes)
     */
    protected function getAccessToken()
    {
        return Cache::remember('rag_engine_access_token', 3000, function () {
            try {
                $credentials = json_decode(file_get_contents($this->credentialsPath), true);
                
                $now = time();
                $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
                $claimSet = json_encode([
                    'iss' => $credentials['client_email'],
                    'scope' => 'https://www.googleapis.com/auth/cloud-platform',
                    'aud' => 'https://oauth2.googleapis.com/token',
                    'iat' => $now,
                    'exp' => $now + 3600,
                ]);

                $base64UrlHeader = $this->base64UrlEncode($header);
                $base64UrlClaimSet = $this->base64UrlEncode($claimSet);
                $signatureInput = $base64UrlHeader . '.' . $base64UrlClaimSet;

                $signature = '';
                openssl_sign($signatureInput, $signature, $credentials['private_key'], 'SHA256');
                $jwt = $signatureInput . '.' . $this->base64UrlEncode($signature);

                $response = $this->httpClient->post('https://oauth2.googleapis.com/token', [
                    'form_params' => [
                        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                        'assertion' => $jwt,
                    ]
                ]);

                $body = json_decode($response->getBody(), true);
                
                if (!isset($body['access_token'])) {
                    throw new Exception('No access token in response');
                }
                
                Log::info('RAG Engine: Access token obtained successfully');
                return $body['access_token'];

            } catch (Exception $e) {
                Log::error('RAG Engine: Failed to get access token', [
                    'error' => $e->getMessage()
                ]);
                throw new Exception('Authentication failed: ' . $e->getMessage());
            }
        });
    }

    /**
     * Base64 URL encode
     */
    protected function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Retrieve contexts using Gemini API with RAG grounding
     * This is the recommended approach for Vertex AI RAG
     */
    public function retrieveContexts(string $query, int $topK = 5)
    {
        try {
            Log::info('RAG Engine: Starting context retrieval via Gemini + RAG', [
                'query' => $query,
                'top_k' => $topK,
                'corpus_id' => $this->corpusId
            ]);

            $startTime = microtime(true);
            $accessToken = $this->getAccessToken();
            
            $endpoint = sprintf(
                'https://%s-aiplatform.googleapis.com/v1/projects/%s/locations/%s/publishers/google/models/%s:generateContent',
                $this->location,
                $this->projectId,
                $this->location,
                $this->model
            );

            $corpusResourceName = sprintf(
                'projects/%s/locations/%s/ragCorpora/%s',
                $this->projectId,
                $this->location,
                $this->corpusId
            );

            $payload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $query]
                        ]
                    ]
                ],
                'tools' => [
                    [
                        'retrieval' => [
                            'vertex_rag_store' => [
                                'rag_resources' => [
                                    [
                                        'rag_corpus' => $corpusResourceName
                                    ]
                                ],
                                'similarity_top_k' => $topK,
                                'vector_distance_threshold' => 0.3
                            ]
                        ]
                    ]
                ]
            ];

            $response = $this->httpClient->post($endpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload
            ]);

            $processingTime = round((microtime(true) - $startTime) * 1000, 2);
            $result = json_decode($response->getBody(), true);

            Log::info('RAG Engine: Full API response', [
                'response' => json_encode($result, JSON_PRETTY_PRINT)
            ]);

            $contexts = [];
            $generatedText = '';

            // Extract generated text
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $generatedText = $result['candidates'][0]['content']['parts'][0]['text'];
            }

            // Extract grounding metadata with better parsing
            if (isset($result['candidates'][0]['groundingMetadata'])) {
                $metadata = $result['candidates'][0]['groundingMetadata'];
                
                Log::info('RAG Engine: Grounding metadata structure', [
                    'keys' => array_keys($metadata),
                    'metadata' => json_encode($metadata, JSON_PRETTY_PRINT)
                ]);
                
                // Try multiple possible grounding chunk structures
                if (isset($metadata['groundingChunks'])) {
                    foreach ($metadata['groundingChunks'] as $index => $chunk) {
                        // Log each chunk structure
                        Log::info("RAG Engine: Chunk {$index} structure", [
                            'chunk_keys' => array_keys($chunk),
                            'chunk' => json_encode($chunk, JSON_PRETTY_PRINT)
                        ]);
                        
                        $text = 'No content';
                        $sourceUri = 'N/A';
                        $relevanceScore = 1.0;
                        
                        // Try different possible paths to get the text
                        if (isset($chunk['chunk']['content'])) {
                            $text = $chunk['chunk']['content'];
                        } elseif (isset($chunk['retrievedContext']['text'])) {
                            $text = $chunk['retrievedContext']['text'];
                        } elseif (isset($chunk['text'])) {
                            $text = $chunk['text'];
                        } elseif (isset($chunk['chunk']['text'])) {
                            $text = $chunk['chunk']['text'];
                        }
                        
                        // Try different possible paths to get the source
                        if (isset($chunk['chunk']['documentMetadata']['uri'])) {
                            $sourceUri = $chunk['chunk']['documentMetadata']['uri'];
                        } elseif (isset($chunk['chunk']['source'])) {
                            $sourceUri = $chunk['chunk']['source'];
                        } elseif (isset($chunk['retrievedContext']['uri'])) {
                            $sourceUri = $chunk['retrievedContext']['uri'];
                        } elseif (isset($chunk['web']['uri'])) {
                            $sourceUri = $chunk['web']['uri'];
                        }
                        
                        // Try to get relevance score
                        if (isset($chunk['score'])) {
                            $relevanceScore = $chunk['score'];
                        } elseif (isset($chunk['relevanceScore'])) {
                            $relevanceScore = $chunk['relevanceScore'];
                        }
                        
                        $contexts[] = [
                            'text' => $text,
                            'source_uri' => $sourceUri,
                            'distance' => 1 - $relevanceScore,
                            'relevance_score' => $relevanceScore
                        ];
                    }
                }
                
                // If no grounding chunks but has support chunks
                if (empty($contexts) && isset($metadata['groundingSupports'])) {
                    foreach ($metadata['groundingSupports'] as $support) {
                        if (isset($support['segment']['text'])) {
                            $contexts[] = [
                                'text' => $support['segment']['text'],
                                'source_uri' => $support['groundingChunkIndices'][0] ?? 'N/A',
                                'distance' => 0,
                                'relevance_score' => 1.0
                            ];
                        }
                    }
                }
            }

            // If we got a generated response but no explicit contexts, 
            // the response itself is grounded in the RAG corpus
            if (empty($contexts) && !empty($generatedText)) {
                Log::info('RAG Engine: No explicit contexts found, but generated text exists (grounded response)');
                $contexts[] = [
                    'text' => 'Response is grounded in RAG corpus documents',
                    'source_uri' => 'RAG Corpus: ' . $this->corpusName,
                    'distance' => 0,
                    'relevance_score' => 1.0
                ];
            }

            Log::info('RAG Engine: Context extraction completed', [
                'contexts_found' => count($contexts),
                'has_generated_text' => !empty($generatedText),
                'generated_text_length' => strlen($generatedText)
            ]);

            return [
                'success' => true,
                'contexts' => $contexts,
                'generated_response' => $generatedText,
                'processing_time_ms' => $processingTime,
                'corpus_name' => $this->corpusName,
                'corpus_id' => $this->corpusId,
                'raw_response' => $result
            ];

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $errorBody = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : 'No response body';
            
            Log::error('RAG Engine: HTTP request failed', [
                'error' => $e->getMessage(),
                'response' => $errorBody
            ]);

            return [
                'success' => false,
                'error' => 'HTTP request failed: ' . $e->getMessage(),
                'details' => $errorBody
            ];

        } catch (Exception $e) {
            Log::error('RAG Engine: Failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate content using RAG-enhanced context
     */
    public function generateWithContext(string $query, array $additionalContext = [])
    {
        try {
            $contextResult = $this->retrieveContexts($query);
            
            if (!$contextResult['success']) {
                throw new Exception('Failed to retrieve contexts: ' . $contextResult['error']);
            }

            $contexts = $contextResult['contexts'];
            $generatedResponse = $contextResult['generated_response'] ?? '';
            
            // If we have a generated response, use it
            if (!empty($generatedResponse)) {
                return [
                    'success' => true,
                    'contexts' => $contexts,
                    'generated_response' => $generatedResponse,
                    'processing_time_ms' => $contextResult['processing_time_ms'],
                    'message' => 'RAG-enhanced response generated successfully'
                ];
            }

            // Otherwise, build enhanced prompt manually
            $contextText = $this->buildContextText($contexts);
            $enhancedPrompt = $this->buildEnhancedPrompt($query, $contextText, $additionalContext);

            return [
                'success' => true,
                'contexts' => $contexts,
                'enhanced_prompt' => $enhancedPrompt,
                'processing_time_ms' => $contextResult['processing_time_ms'],
                'message' => 'RAG contexts retrieved successfully'
            ];

        } catch (Exception $e) {
            Log::error('RAG Engine: Failed to generate content', [
                'error' => $e->getMessage(),
                'query' => $query
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Build context text from retrieved contexts
     */
    protected function buildContextText(array $contexts): string
    {
        if (empty($contexts)) {
            return "No relevant contexts found in the knowledge base.";
        }

        $contextParts = [];
        
        foreach ($contexts as $index => $context) {
            $contextParts[] = sprintf(
                "Context %d (Relevance: %.2f%%):\n%s",
                $index + 1,
                ($context['relevance_score'] ?? 1.0) * 100,
                $context['text']
            );
        }

        return implode("\n\n", $contextParts);
    }

    /**
     * Build enhanced prompt with RAG contexts
     */
    protected function buildEnhancedPrompt(string $query, string $contextText, array $additionalContext = []): string
    {
        $prompt = "You are a financial assistant helping users manage their personal finances.\n\n";
        $prompt .= "Based on the following knowledge base context, please answer the user's question:\n\n";
        $prompt .= "KNOWLEDGE BASE CONTEXT:\n{$contextText}\n\n";
        
        if (!empty($additionalContext)) {
            $prompt .= "USER'S FINANCIAL DATA:\n";
            foreach ($additionalContext as $key => $value) {
                $prompt .= "{$key}: {$value}\n";
            }
            $prompt .= "\n";
        }
        
        $prompt .= "USER QUESTION: {$query}\n\n";
        $prompt .= "Please provide a helpful, accurate answer based on the context above. ";
        $prompt .= "If the context doesn't contain enough information, acknowledge that and provide general financial advice.";

        return $prompt;
    }

    /**
     * Get financial advice using RAG Engine
     */
    public function getFinancialAdvice(string $question, array $userFinancialData = [])
    {
        return $this->generateWithContext($question, $userFinancialData);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Google\Cloud\DocumentAI\V1\Client\DocumentProcessorServiceClient;
use Google\Cloud\DocumentAI\V1\ProcessRequest;
use Google\Cloud\DocumentAI\V1\RawDocument;
use Google\ApiCore\ApiException;

class DocumentAIController extends Controller
{
    /**
     * Handle the receipt upload and process it with Document AI.
     */
    public function processReceipt(Request $request)
    {
        // 1. Validate the incoming file upload (support both 'image' and 'receipt' fields)
        $request->validate([
            'image' => 'nullable|file|mimes:pdf,jpeg,png,gif,tiff|max:10240', // From frontend
            'receipt' => 'nullable|file|mimes:pdf,jpeg,png,gif,tiff|max:10240', // Alternative field name
        ]);

        // Check that at least one file field is provided
        if (!$request->hasFile('image') && !$request->hasFile('receipt')) {
            return response()->json([
                'error' => 'No file provided. Please upload a receipt image or PDF.'
            ], 400);
        }

        try {
            // 2. Prepare the necessary IDs and file content
            $projectId = env('GOOGLE_CLOUD_PROJECT_ID');
            $location = env('DOCUMENT_AI_LOCATION');
            $processorId = env('DOCUMENT_AI_PROCESSOR_ID');

            // Debug logging to help identify configuration issues
            Log::info('Document AI Configuration Check', [
                'project_id_set' => !empty($projectId),
                'location_set' => !empty($location),
                'processor_id_set' => !empty($processorId),
                'project_id' => $projectId ? 'Set (***' . substr($projectId, -4) . ')' : 'NOT SET',
                'location' => $location ?: 'NOT SET',
                'processor_id' => $processorId ? 'Set (***' . substr($processorId, -4) . ')' : 'NOT SET',
                'google_credentials_set' => !empty(env('GOOGLE_APPLICATION_CREDENTIALS')),
            ]);

            // Check if all required environment variables are set
            if (empty($projectId) || empty($location) || empty($processorId)) {
                return response()->json([
                    'error' => 'Document AI configuration incomplete. Please check your .env file for GOOGLE_CLOUD_PROJECT_ID, DOCUMENT_AI_LOCATION, and DOCUMENT_AI_PROCESSOR_ID.'
                ], 500);
            }

            // Get the file from either 'image' or 'receipt' field
            $file = $request->hasFile('image') ? $request->file('image') : $request->file('receipt');
            $fileContent = file_get_contents($file->getRealPath());
            $mimeType = $file->getMimeType();

            Log::info('Document AI File Processing', [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $mimeType,
                'file_size_mb' => round($file->getSize() / 1024 / 1024, 2),
            ]);

            // 3. Instantiate the Document AI Client
            try {
                $documentAiClient = new DocumentProcessorServiceClient();
                Log::info('Document AI Client created successfully');
            } catch (\Exception $e) {
                Log::error('Failed to create Document AI Client', [
                    'error' => $e->getMessage(),
                    'credentials_env' => env('GOOGLE_APPLICATION_CREDENTIALS'),
                ]);
                return response()->json([
                    'error' => 'Failed to initialize Google Cloud Document AI client. Please check your credentials configuration.',
                    'details' => $e->getMessage()
                ], 500);
            }

            // 4. Construct the full processor resource name
            $name = $documentAiClient->processorName($projectId, $location, $processorId);
            
            Log::info('Document AI Processor Details', [
                'processor_name' => $name,
                'project_id' => $projectId,
                'location' => $location,
                'processor_id' => $processorId,
            ]);

            // 5. Create the RawDocument object
            $rawDocument = new RawDocument([
                'content' => $fileContent,
                'mime_type' => $mimeType,
            ]);

            // 6. Create the ProcessRequest and make the API call
            $processRequest = new ProcessRequest([
                'name' => $name,
                'raw_document' => $rawDocument
            ]);

            Log::info('Starting Document AI processing...');
            $startTime = microtime(true);
            
            try {
                $result = $documentAiClient->processDocument($processRequest);
                $processingTime = round((microtime(true) - $startTime) * 1000, 2);
                
                Log::info('Document AI processing completed', [
                    'processing_time_ms' => $processingTime,
                    'success' => true
                ]);
                
                $document = $result->getDocument();
            } catch (ApiException $e) {
                $processingTime = round((microtime(true) - $startTime) * 1000, 2);
                Log::error('Document AI API Exception', [
                    'processing_time_ms' => $processingTime,
                    'status_code' => $e->getStatus(),
                    'error_message' => $e->getMessage(),
                    'error_details' => $e->getBasicMessage(),
                ]);
                
                // Close the client before returning error
                $documentAiClient->close();
                
                return response()->json([
                    'error' => 'Google Cloud Document AI API Error',
                    'details' => $e->getMessage(),
                    'status_code' => $e->getStatus(),
                    'processing_time_ms' => $processingTime
                ], 500);
            }

            // 7. Extract the entities (the structured data)
            $processedData = [];
            $extractedFields = [
                'type' => 'expense', // Default type
                'amount' => '',
                'date' => null, // Set to null instead of empty string to indicate no date found
                'category' => 'Other',
                'description' => ''
            ];
            
            $entityCount = 0;
            $rawDateValue = '';
            
            foreach ($document->getEntities() as $entity) {
                $entityType = $entity->getType();
                $entityValue = $entity->getMentionText();
                $entityCount++;
                
                Log::info('Processing Document AI entity', [
                    'type' => $entityType,
                    'value' => $entityValue,
                    'lowercase_type' => strtolower($entityType)
                ]);
                
                $processedData[] = [
                    'type' => $entityType,
                    'value' => $entityValue,
                    'confidence' => number_format($entity->getConfidence() * 100, 2) . '%',
                ];
                
                // Map processor entities to expected fields
                switch (strtolower($entityType)) {
                    case 'type':
                        $extractedFields['type'] = $entityValue;
                        break;
                    case 'amount':
                    case 'total_amount':
                    case 'receipt_amount':
                        $extractedFields['amount'] = $this->normalizeAmount($entityValue);
                        Log::info('Amount normalized', [
                            'original' => $entityValue,
                            'normalized' => $extractedFields['amount']
                        ]);
                        break;
                    case 'date':
                    case 'receipt_date':
                    case 'transaction_date':
                        $rawDateValue = $entityValue;
                        $extractedFields['date'] = $this->parseReceiptDate($entityValue);
                        break;
                    case 'category':
                        $extractedFields['category'] = $entityValue;
                        break;
                    case 'description':
                    case 'merchant_name':
                    case 'supplier_name':
                        $extractedFields['description'] = $entityValue;
                        break;
                    default:
                        Log::info('Unhandled entity type', [
                            'type' => $entityType,
                            'lowercase_type' => strtolower($entityType),
                            'value' => $entityValue
                        ]);
                }
            }
            
            Log::info('Document AI entity extraction completed', [
                'entity_count' => $entityCount,
                'raw_date_value' => $rawDateValue,
                'parsed_date' => $extractedFields['date'],
                'extracted_fields' => $extractedFields,
                'full_text_length' => strlen($document->getText()),
            ]);
            
            // 8. Close the client and return the JSON response
            $documentAiClient->close();

            return response()->json([
                'success' => true,
                'message' => 'Document processed successfully with Google Document AI!',
                'data' => $processedData, // Raw entities for debugging
                'extracted' => $extractedFields, // Formatted fields for frontend
                'full_text' => $document->getText(), // Full OCR text
                'processing_stats' => [
                    'entity_count' => $entityCount,
                    'processing_time_ms' => $processingTime,
                    'text_length' => strlen($document->getText()),
                ],
                'debug_info' => [
                    'raw_date_extracted' => $rawDateValue,
                    'parsed_date' => $extractedFields['date'],
                    'date_parsing_successful' => !is_null($extractedFields['date']),
                    'timestamp' => now()->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (ApiException $e) {
            // Handle API errors - this catches any remaining API exceptions
            Log::error('Document AI API Exception (General)', [
                'status_code' => $e->getStatus(),
                'error_message' => $e->getMessage(),
                'error_details' => $e->getBasicMessage(),
            ]);
            
            return response()->json([
                'error' => 'Google Cloud Document AI API Error',
                'details' => $e->getMessage(),
                'status_code' => $e->getStatus()
            ], 500);
        } catch (\Exception $e) {
            // Handle other general errors
            Log::error('Document AI General Exception', [
                'error_type' => get_class($e),
                'error_message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'An unexpected error occurred during document processing',
                'details' => $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }

    /**
     * Parse various receipt date formats into a standardized Y-m-d format
     * Returns null if date cannot be parsed
     */
    private function parseReceiptDate($dateString)
    {
        if (empty($dateString)) {
            return null;
        }

        // Clean the date string
        $dateString = trim($dateString);
        
        Log::info('Attempting to parse receipt date', [
            'original' => $dateString,
        ]);

        // Common receipt date formats to try
        $formats = [
            // Standard formats
            'Y-m-d',
            'd/m/Y',
            'm/d/Y',
            'd-m-Y',
            'm-d-Y',
            'd.m.Y',
            'm.d.Y',
            // Short year formats
            'd/m/y',
            'm/d/y',
            'd-m-y',
            'm-d-y',
            'd.m.y',
            'm.d.y',
            // Month name formats
            'd M Y',
            'd F Y',
            'M d Y',
            'F d Y',
            'd M y',
            'd F y',
            'M d y',
            'F d y',
            // Special receipt formats
            'd My',      // Like "10 May 19"
            'd Fy',      // Like "10 January 19"
            'j M y',     // Like "5 May 19"
            'j F y',     // Like "5 January 19"
            // Without space
            'dMy',       // Like "10May19"
            'dFy',       // Like "10January19"
        ];

        foreach ($formats as $format) {
            try {
                $date = \DateTime::createFromFormat($format, $dateString);
                if ($date !== false) {
                    // Handle 2-digit years (assume 20xx for years 00-30, 19xx for years 31-99)
                    $year = (int) $date->format('Y');
                    if ($year < 100) {
                        if ($year <= 30) {
                            $year += 2000;
                        } else {
                            $year += 1900;
                        }
                        $date->setDate($year, (int) $date->format('m'), (int) $date->format('d'));
                    }
                    
                    $parsedDate = $date->format('Y-m-d');
                    Log::info('Successfully parsed receipt date', [
                        'original' => $dateString,
                        'format_used' => $format,
                        'parsed_date' => $parsedDate
                    ]);
                    
                    return $parsedDate;
                }
            } catch (\Exception $e) {
                // Continue to next format
                continue;
            }
        }

        // Try using PHP's strtotime as a fallback
        try {
            $timestamp = strtotime($dateString);
            if ($timestamp !== false) {
                $parsedDate = date('Y-m-d', $timestamp);
                Log::info('Parsed receipt date using strtotime', [
                    'original' => $dateString,
                    'parsed_date' => $parsedDate
                ]);
                return $parsedDate;
            }
        } catch (\Exception $e) {
            // Final fallback failed
        }

        Log::warning('Failed to parse receipt date', [
            'original' => $dateString,
            'attempted_formats' => count($formats)
        ]);

        return null;
    }

    /**
     * Normalize amount values by removing currency symbols, commas, and handling decimal separators
     * Returns a clean numeric value or empty string if no valid amount found
     */
    private function normalizeAmount($amountString)
    {
        if (empty($amountString)) {
            return '';
        }

        $originalAmount = trim($amountString);
        
        Log::info('Attempting to normalize amount', [
            'original' => $originalAmount,
        ]);

        // Remove common currency symbols and prefixes
        $cleaned = $originalAmount;
        $currencySymbols = ['$', '€', '£', '¥', '₹', 'Rp', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'IDR', 'SGD', 'MYR'];
        
        foreach ($currencySymbols as $symbol) {
            $cleaned = str_ireplace($symbol, '', $cleaned);
        }
        
        // Remove extra whitespace
        $cleaned = trim($cleaned);
        
        // Handle different number formats
        // Pattern 1: 1,234.56 (US format)
        if (preg_match('/^([0-9]{1,3}(?:,[0-9]{3})*)\.([0-9]{1,2})$/', $cleaned, $matches)) {
            $result = str_replace(',', '', $matches[1]) . '.' . $matches[2];
            Log::info('Normalized amount (US format)', ['original' => $originalAmount, 'result' => $result]);
            return $result;
        }
        
        // Pattern 2: 1.234,56 (European format)
        if (preg_match('/^([0-9]{1,3}(?:\.[0-9]{3})*),([0-9]{1,2})$/', $cleaned, $matches)) {
            $result = str_replace('.', '', $matches[1]) . '.' . $matches[2];
            Log::info('Normalized amount (European format)', ['original' => $originalAmount, 'result' => $result]);
            return $result;
        }
        
        // Pattern 3: Simple decimals like 12.34 or 1234.56
        if (preg_match('/^[0-9]+\.[0-9]{1,2}$/', $cleaned)) {
            Log::info('Normalized amount (simple decimal)', ['original' => $originalAmount, 'result' => $cleaned]);
            return $cleaned;
        }
        
        // Pattern 4: Numbers with commas as thousands separator (no decimal)
        if (preg_match('/^[0-9]{1,3}(?:,[0-9]{3})+$/', $cleaned)) {
            $result = str_replace(',', '', $cleaned);
            Log::info('Normalized amount (comma thousands)', ['original' => $originalAmount, 'result' => $result]);
            return $result;
        }
        
        // Pattern 5: Numbers with dots as thousands separator (no decimal)
        if (preg_match('/^[0-9]{1,3}(?:\.[0-9]{3})+$/', $cleaned)) {
            $result = str_replace('.', '', $cleaned);
            Log::info('Normalized amount (dot thousands)', ['original' => $originalAmount, 'result' => $result]);
            return $result;
        }
        
        // Pattern 6: Plain integers
        if (preg_match('/^[0-9]+$/', $cleaned)) {
            Log::info('Normalized amount (plain integer)', ['original' => $originalAmount, 'result' => $cleaned]);
            return $cleaned;
        }
        
        // Pattern 7: Try to extract any sequence of digits and decimal point
        if (preg_match('/([0-9]+(?:[.,][0-9]+)?)/', $cleaned, $matches)) {
            $result = str_replace(',', '.', $matches[1]);
            Log::info('Normalized amount (extracted digits)', ['original' => $originalAmount, 'result' => $result]);
            return $result;
        }
        
        // If nothing matches, try to extract just digits and assume no decimal
        $digitsOnly = preg_replace('/[^0-9]/', '', $cleaned);
        if (!empty($digitsOnly)) {
            Log::info('Normalized amount (digits only fallback)', ['original' => $originalAmount, 'result' => $digitsOnly]);
            return $digitsOnly;
        }
        
        Log::warning('Failed to normalize amount', [
            'original' => $originalAmount,
            'cleaned' => $cleaned
        ]);
        
        return '';
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RagEngineService;
use Exception;

class RagEngineController extends Controller
{
    protected $ragService;

    public function __construct(RagEngineService $ragService)
    {
        $this->ragService = $ragService;
    }

    /**
     * Query the RAG Engine for financial advice
     */
    public function query(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:1000',
            'top_k' => 'nullable|integer|min:1|max:10'
        ]);

        try {
            $query = $request->input('query');
            $topK = $request->input('top_k', 5);

            $result = $this->ragService->retrieveContexts($query, $topK);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'data' => $result['contexts'],
                    'generated_response' => $result['generated_response'],
                    'processing_time_ms' => $result['processing_time_ms'],
                    'corpus_name' => $result['corpus_name'],
                    'message' => 'Successfully retrieved contexts from RAG Engine'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to process query: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate financial advice with RAG context
     */
    public function getAdvice(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
            'financial_data' => 'nullable|array'
        ]);

        try {
            $question = $request->input('question');
            $financialData = $request->input('financial_data', []);

            $result = $this->ragService->retrieveContexts($question, 5);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'contexts' => $result['contexts'],
                    'generated_response' => $result['generated_response'],
                    'processing_time_ms' => $result['processing_time_ms'],
                    'message' => 'RAG-enhanced financial advice generated successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 500);
            }

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate advice: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test RAG Engine connection
     */
    public function test()
    {
        try {
            $testQuery = "What is a good savings rate for personal finance?";
            $result = $this->ragService->retrieveContexts($testQuery, 3);

            return response()->json([
                'status' => $result['success'] ? 'success' : 'failed',
                'test_query' => $testQuery,
                'generated_response' => $result['generated_response'] ?? null,
                'contexts' => $result['contexts'] ?? [],
                'processing_time_ms' => $result['processing_time_ms'] ?? null,
                'result' => $result
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

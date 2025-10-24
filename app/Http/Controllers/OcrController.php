<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiAIService;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Exception;

class OcrController extends Controller
{
    protected $geminiAI;

    public function __construct(GeminiAIService $geminiAI)
    {
        $this->geminiAI = $geminiAI;
    }

    public function getAIResponse(Request $request)
    {
        $request->validate(['image' => 'required|image|max:4096']);
        
        try {
            $imageFile = $request->file('image');
            $response = $this->geminiAI->extractReceiptData($imageFile);
            return response()->json($response);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Process receipt and extract data (without creating transaction)
     * This method works with your existing /process-receipt route
     */
    public function processReceipt(Request $request)
    {
        $request->validate(['image' => 'required|image|max:4096']);
        
        try {
            $imageFile = $request->file('image');
            $ocrData = $this->geminiAI->extractReceiptData($imageFile);
            
            // Map category name to category ID
            $categoryName = $ocrData['category'] ?? 'Other Expense';
            $category = Category::where('category_name', $categoryName)->first();
            
            // If category not found, try to find a default category
            if (!$category) {
                $type = ($ocrData['type'] ?? 'expense') === 'income' ? 'income' : 'expense';
                $defaultCategoryName = $type === 'income' ? 'Other Income' : 'Other Expense';
                $category = Category::where('category_name', $defaultCategoryName)->first();
            }
            
            // If still not found, get any category of the correct type
            if (!$category) {
                $type = ($ocrData['type'] ?? 'expense') === 'income' ? 'income' : 'expense';
                $category = Category::where('type', $type)->first();
            }
            
            // Final fallback - get any category
            if (!$category) {
                $category = Category::first();
            }
            
            if (!$category) {
                throw new Exception('No categories found in database. Please create categories first.');
            }
            
            // Format response for frontend (WITHOUT creating transaction)
            $formattedResponse = [
                'success' => true,
                'message' => 'Receipt data extracted successfully',
                'amount' => $ocrData['amount'] ?? 0,
                'date' => $ocrData['date'] ?? date('Y-m-d'),
                'description' => $ocrData['description'] ?? 'Receipt transaction',
                'category' => $category->category_name,
                'category_id' => $category->id,
                'items' => $ocrData['items'] ?? [],
            ];
            
            return response()->json($formattedResponse, 200);
            
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

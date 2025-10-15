<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type'); // 'income' or 'expense'
        
        Log::info('CategoryController - Request received', [
            'type_param' => $type,
            'all_params' => $request->all()
        ]);
        
        $query = Category::query();
        
        // Filter by type if provided
        if ($type) {
            $query->where('type', '=', $type);
        }
        
        $categories = $query->orderBy('category_name')->get();
        
        Log::info('CategoryController - Query result', [
            'type_requested' => $type,
            'count' => $categories->count(),
            'categories' => $categories->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->category_name,
                'type' => $c->type
            ])->toArray()
        ]);
        
        return response()->json($categories);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type');
        
        $query = Category::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        $categories = $query->orderBy('category_name')->get();
        
        return response()->json($categories);
    }
}

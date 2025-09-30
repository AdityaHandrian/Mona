<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();
        if ($request->has("type")){
            $query->where("type", $request->get("type"));
        }
        $categories = $query->get();

        return response()->json($categories);
    }
}

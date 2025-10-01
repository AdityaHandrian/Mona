<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\TransactionController;

Route::get("/categories", [CategoryController::class, "index"]);
// Use Sanctum for SPA stateful authentication
Route::middleware('auth')->group(function () {
    Route::post("/transactions", [TransactionController::class, "store"]);
    Route::get("/transactions", [TransactionController::class, "index"]);
});
<?php

use App\Http\Controllers\TransactionController; // Add this import
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Add transaction routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/transactions/history', [TransactionController::class, 'history']); // New history endpoint
    Route::get('/transactions/monthly-stats', [TransactionController::class, 'monthlyStats']);
    Route::post('/transactions/quick-add', [TransactionController::class, 'quickAdd']);

    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
});
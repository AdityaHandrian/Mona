<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OcrController;
use App\Http\Controllers\DocumentAIController;
use App\Http\Controllers\TransactionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return redirect()->route('dashboard');
    }
    
    return Inertia::render('Landing', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function (Request $request) {
    return Inertia::render('Dashboard', [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/transaction', function (Request $request) {
    return Inertia::render('Transaction', [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('transaction');

Route::get('/scan-receipt', function (Request $request) {
    return Inertia::render('ScanReceipt', [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('scan-receipt');

Route::get('/budget', function (Request $request) {
    return Inertia::render('Budget', [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('budget');

Route::get('/history', function (Request $request) {
    return Inertia::render('History', [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
})->middleware(['auth', 'verified'])->name('history');

Route::get('/testing', function () {
    return view('testing');
})->name('testing');

Route::get('/dashboard-api-test', function () {
    return view('dashboard-api-test');
})->name('dashboard-api-test');

Route::post('/process-receipt', [OcrController::class, 'processReceipt']);
Route::post('/process-receipt-ai', [DocumentAIController::class, 'processReceipt']);

// profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/photo', [ProfileController::class, 'removePhoto'])->name('profile.remove-photo');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// API transactions routes — pakai auth session bawaan
Route::middleware('auth')->group(function () {
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions',  [TransactionController::class, 'index']);
});

Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/monthly-stats', [TransactionController::class, 'monthlyStats']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
});

Route::middleware(['auth'])->group(function () {
    // Budget routes
    Route::get('/budget', [\App\Http\Controllers\BudgetController::class, 'index'])->name('budget');
    Route::post('/budgets', [\App\Http\Controllers\BudgetController::class, 'store'])->name('budgets.store');
    Route::put('/budgets/{budget}', [\App\Http\Controllers\BudgetController::class, 'update'])->name('budgets.update');
    Route::delete('/budgets/{budget}', [\App\Http\Controllers\BudgetController::class, 'destroy'])->name('budgets.destroy');
    
    // API-like routes for React components
    Route::get('/api/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('/api/budgets/check', [\App\Http\Controllers\BudgetController::class, 'checkBudget']);
    
    // History page routes (original methods)
    Route::get('/api/transactions', [\App\Http\Controllers\TransactionController::class, 'index']);
    Route::post('/api/transactions', [\App\Http\Controllers\TransactionController::class, 'store']);
    Route::put('/api/transactions/{id}', [\App\Http\Controllers\TransactionController::class, 'update']);
    Route::delete('/api/transactions/{id}', [\App\Http\Controllers\TransactionController::class, 'destroy']);
    
    // Transaction.jsx routes
    Route::post('/api/transactions/add', [\App\Http\Controllers\TransactionController::class, 'apiStore']);
    Route::get('/api/transactions/monthly-stats', [\App\Http\Controllers\TransactionController::class, 'monthlyStats']);
    
    // ScanReceipt.jsx routes
    Route::post('/api/transactions/quick-add', [\App\Http\Controllers\TransactionController::class, 'quickAdd']);
    
    // Dashboard API routes
    Route::get('/api/dashboard/monthly-stats', [\App\Http\Controllers\DashboardController::class, 'monthlyStats']);
    Route::get('/api/dashboard/financial-overview', [\App\Http\Controllers\DashboardController::class, 'financialOverview']);
    Route::get('/api/dashboard/expense-categories', [\App\Http\Controllers\DashboardController::class, 'expenseCategories']);
    Route::get('/api/dashboard/complete', [\App\Http\Controllers\DashboardController::class, 'completeData']);
});
require __DIR__.'/auth.php';

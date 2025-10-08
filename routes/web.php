<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OcrController;
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

Route::post('/process-receipt', [OcrController::class, 'processReceipt']);

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

require __DIR__.'/auth.php';

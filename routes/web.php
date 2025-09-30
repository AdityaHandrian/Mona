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
        'canLogin' => Route::has('login'),
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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth:api') // ganti ke 'auth:sanctum' / 'jwt.auth' sesuai guard yang kamu pakai
    ->group(function () {
        Route::post('transactions', [TransactionController::class, 'store']);
    });

require __DIR__.'/auth.php';
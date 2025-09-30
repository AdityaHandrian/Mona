<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // POST /api/transactions
    public function store(StoreTransactionRequest $request)
    {
        $payload = $request->validated();
        $payload['user_id'] = $request->user()->id;

        $transaction = DB::transaction(fn() => Transaction::create($payload));

        return response()->json([
            'status' => 'success',
            'data' => [
                'transaction_id'   => $transaction->id,
                'user_id'          => $transaction->user_id,
                'category_id'      => $transaction->category_id,
                // supaya number di JSON, cast manual (karena decimal:2 -> string)
                'amount'           => (float) $transaction->amount,
                'description'      => $transaction->description,
                'transaction_date' => $transaction->transaction_date?->toIso8601String(),
                'created_at'       => $transaction->created_at?->toIso8601String(),
            ],
        ], 201);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    //POST /api/transactions
     
    public function store(\App\Http\Requests\StoreTransactionRequest $request)
    {
        
        $payload = $request->validated();
        $payload['user_id'] = $request->user()->id;

        $trx = \DB::transaction(fn () => \App\Models\Transaction::create($payload));
        
        return response()->json([
            'status' => 'success',
            'data'   => [
                'transaction_id'   => (int) $trx->id,
                'user_id'          => (int) $trx->user_id,
                'category_id'      => (int) $trx->category_id,
                'amount'           => (float) $trx->amount, // DECIMAL(15,2)
                'description'      => $trx->description,
                'transaction_date' => optional($trx->transaction_date)->toIso8601String(),
                'created_at'       => optional($trx->created_at)->toIso8601String(),
            ],
        ], 201);
    }

    //GET /api/transactions
    
    public function index(Request $request)
    {
        $validated = $request->validate([
            'type'        => ['nullable', 'in:income,expense'],
            'category_id' => ['nullable', 'integer'],
            'search'      => ['nullable', 'string', 'max:255'],
            'date_from'   => ['nullable', 'date'],
            'date_to'     => ['nullable', 'date'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $userId   = $request->user()->id;
        $type     = $validated['type']        ?? null;
        $catId    = $validated['category_id'] ?? null;
        $search   = $validated['search']      ?? null;
        $dateFrom = $validated['date_from']   ?? null;
        $dateTo   = $validated['date_to']     ?? null;
        $perPage  = $validated['per_page']    ?? 15;

        $query = DB::table('transactions as T')
            // SESUAIKAN PK categories: pakai 'C.id' jika PK = id, atau 'C.category_id' jika PK = category_id
            ->join('categories as C', 'T.category_id', '=', 'C.id')
            ->where('T.user_id', $userId)
            ->select([
                'T.id as transaction_id',
                'T.user_id',
                'T.category_id',
                'T.amount',
                'T.description',
                'T.transaction_date',
                'C.category_name',
                'C.type',
            ])
            ->when($type, fn($q) => $q->where('C.type', $type))
            ->when($catId, fn($q) => $q->where('T.category_id', $catId))
            ->when($search, fn($q) => $q->where('T.description', 'like', "%{$search}%"))
            ->when($dateFrom, fn($q) => $q->whereDate('T.transaction_date', '>=', $dateFrom))
            ->when($dateTo, fn($q) => $q->whereDate('T.transaction_date', '<=', $dateTo))
            ->orderBy('T.transaction_date', 'desc');

        $page = $query->paginate($perPage);

        $items = collect($page->items())->map(function ($row) {
            $isoDate = null;
            if (!empty($row->transaction_date)) {
                try {
                    $isoDate = \Carbon\Carbon::parse($row->transaction_date)->toIso8601String();
                } catch (\Throwable $e) {
                    $isoDate = $row->transaction_date;
                }
            }

            return [
                'transaction_id'   => (int) $row->transaction_id,
                'user_id'          => (int) $row->user_id,
                'category_id'      => (int) $row->category_id,
                'amount'           => (int) $row->amount,
                'description'      => $row->description,
                'transaction_date' => $isoDate,
                'category_name'    => $row->category_name,
                'type'             => $row->type,
            ];
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Transactions fetched',
            'data'    => $items,
            'meta'    => [
                'current_page' => $page->currentPage(),
                'per_page'     => $page->perPage(),
                'total'        => $page->total(),
                'last_page'    => $page->lastPage(),
            ],
        ]);
    }
}

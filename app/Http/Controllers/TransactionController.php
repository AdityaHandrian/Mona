<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    //POST /api/transactions
     
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
                'amount'           => (float) $transaction->amount,
                'description'      => $transaction->description,
                'transaction_date' => $transaction->transaction_date?->toIso8601String(),
                'created_at'       => $transaction->created_at?->toIso8601String(),
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

        // Map DB rows to the frontend shape used in resources/js/Pages/History.jsx
        // Frontend expects: { id, date, type, category, description, amount }
        $items = collect($page->items())->map(function ($row) {
            // Format date as D/M/YYYY to match the dummy data (e.g. '1/9/2025')
            $date = null;
            if (!empty($row->transaction_date)) {
                try {
                    $date = \Carbon\Carbon::parse($row->transaction_date)->format('j/n/Y');
                } catch (\Throwable $e) {
                    $date = $row->transaction_date;
                }
            }

            // type in DB is 'income' or 'expense' (lowercase). Frontend uses 'Income'/'Expense'
            $typeLabel = isset($row->type) ? ucfirst($row->type) : null;

            // Amount in DB is positive; make it negative for expense to match frontend dummy values
            $amount = (float) $row->amount;
            if (isset($row->type) && $row->type === 'expense') {
                $amount = -1 * abs($amount);
            }

            return [
                'id' => (int) $row->transaction_id,
                'date' => $date,
                'type' => $typeLabel,
                'category' => $row->category_name,
                'description' => $row->description,
                'amount' => $amount,
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
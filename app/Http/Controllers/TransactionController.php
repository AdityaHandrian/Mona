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

        $trx = DB::transaction(fn () => \App\Models\Transaction::create($payload));
        
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
    
    // PUT /api/transactions/{id}
    public function update(StoreTransactionRequest $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            
            // Check if the transaction belongs to the authenticated user
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You can only update your own transactions.'
                ], 403);
            }

            $payload = $request->validated();
            
            // Update the transaction
            DB::transaction(function () use ($transaction, $payload) {
                $transaction->update($payload);
            });

            // Refresh the model to get updated data
            $transaction->refresh();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction updated successfully.',
                'data' => [
                    'transaction_id'   => (int) $transaction->id,
                    'user_id'          => (int) $transaction->user_id,
                    'category_id'      => (int) $transaction->category_id,
                    'amount'           => (float) $transaction->amount,
                    'description'      => $transaction->description,
                    'transaction_date' => optional($transaction->transaction_date)->toIso8601String(),
                    'updated_at'       => optional($transaction->updated_at)->toIso8601String(),
                ],
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while updating the transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // DELETE /api/transactions/{id}
    public function destroy(Request $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            
            // Check if the transaction belongs to the authenticated user
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You can only delete your own transactions.'
                ], 403);
            }

            // Store transaction data before deletion for response
            $deletedTransactionData = [
                'transaction_id'   => $transaction->id,
                'user_id'          => $transaction->user_id,
                'category_id'      => $transaction->category_id,
                'amount'           => (float) $transaction->amount,
                'description'      => $transaction->description,
                'transaction_date' => $transaction->transaction_date?->toIso8601String(),
            ];

            // Delete the transaction
            DB::transaction(fn() => $transaction->delete());

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction deleted successfully.',
                'data' => $deletedTransactionData
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction not found.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while deleting the transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/transactions/monthly-stats
    public function monthlyStats(Request $request)
    {
        $validated = $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year'  => ['required', 'integer', 'min:1900', 'max:2100'],
        ]);

        $userId = $request->user()->id;
        $month = $validated['month'];
        $year = $validated['year'];

        try {
            // Get total income (positive amounts from income categories)
            $totalIncome = DB::table('transactions as T')
                ->join('categories as C', 'T.category_id', '=', 'C.id')
                ->where('T.user_id', $userId)
                ->where('C.type', 'income')
                ->whereMonth('T.transaction_date', $month)
                ->whereYear('T.transaction_date', $year)
                ->sum('T.amount');

            // Get total expenses (positive amounts from expense categories, but we'll return as positive)
            $totalExpenses = DB::table('transactions as T')
                ->join('categories as C', 'T.category_id', '=', 'C.id')
                ->where('T.user_id', $userId)
                ->where('C.type', 'expense')
                ->whereMonth('T.transaction_date', $month)
                ->whereYear('T.transaction_date', $year)
                ->sum('T.amount');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_income' => (float) ($totalIncome ?? 0),
                    'total_expenses' => (float) ($totalExpenses ?? 0),
                    'net_balance' => (float) (($totalIncome ?? 0) - ($totalExpenses ?? 0)),
                    'month' => $month,
                    'year' => $year,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching monthly statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ============================================
    // NEW METHODS FOR TRANSACTION.JSX & SCANRECEIPT.JSX
    // ============================================
    
    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? '',
            'transaction_date' => $validated['transaction_date'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction created successfully',
            'data' => $transaction
        ], 201);
    }
}
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    // ============================================
    // ORIGINAL METHODS FOR HISTORY PAGE (unchanged format)
    // ============================================
    
    //POST /api/transactions
    public function store(StoreTransactionRequest $request)
    {
        $payload = $request->validated();
        $payload['user_id'] = $request->user()->id;

        $trx = DB::transaction(function () use ($payload, $request) {
            // Create the transaction
            $transaction = \App\Models\Transaction::create($payload);
            
            // Handle transaction details if provided
            if ($request->has('transaction_details') && is_array($request->transaction_details)) {
                $totalAmount = 0;
                
                foreach ($request->transaction_details as $detail) {
                    $transactionDetail = $transaction->transactionDetails()->create([
                        'category_id' => $detail['category_id'] ?? $payload['category_id'],
                        'item_name' => $detail['item_name'],
                        'quantity' => $detail['quantity'] ?? 1,
                        'item_price' => $detail['item_price'],
                        // subtotal will be calculated automatically by the model
                    ]);
                    $totalAmount += $transactionDetail->subtotal;
                }
                
                // Update transaction amount with calculated total from details
                if ($totalAmount > 0) {
                    $transaction->update(['amount' => $totalAmount]);
                }
            }
            
            return $transaction->load('transactionDetails');
        });
        
        return response()->json([
            'status' => 'success',
            'data'   => [
                'transaction_id'   => (int) $trx->id,
                'user_id'          => (int) $trx->user_id,
                'category_id'      => (int) $trx->category_id,
                'amount'           => (float) $trx->amount,
                'description'      => $trx->description,
                'transaction_date' => optional($trx->transaction_date)->toIso8601String(),
                'created_at'       => optional($trx->created_at)->toIso8601String(),
                'details'          => $trx->transactionDetails->map(fn($d) => [
                    'id' => $d->id,
                    'item_name' => $d->item_name,
                    'quantity' => $d->quantity,
                    'item_price' => (float) $d->item_price,
                    'subtotal' => (float) $d->subtotal,
                ]),
            ],
        ], 201);
    }

    //GET /api/transactions (for History page)
    public function index(Request $request)
    {
        $validated = $request->validate([
            'type'        => ['nullable', 'in:income,expense'],
            'category_id' => ['nullable', 'integer'],
            'search'      => ['nullable', 'string', 'max:255'],
            'date_from'   => ['nullable', 'date'],
            'date_to'     => ['nullable', 'date'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_details' => ['nullable', 'boolean'], // New parameter to include details
        ]);

        $userId   = $request->user()->id;
        $type     = $validated['type']        ?? null;
        $catId    = $validated['category_id'] ?? null;
        $search   = $validated['search']      ?? null;
        $dateFrom = $validated['date_from']   ?? null;
        $dateTo   = $validated['date_to']     ?? null;
        $perPage  = $validated['per_page']    ?? 15;
        $includeDetails = $validated['include_details'] ?? false;

        // If details are requested, use Eloquent instead of Query Builder
        if ($includeDetails) {
            $query = Transaction::with(['category', 'transactionDetails.category'])
                ->where('user_id', $userId)
                ->when($type, function($q) use ($type) {
                    $q->whereHas('category', fn($c) => $c->where('type', $type));
                })
                ->when($catId, fn($q) => $q->where('category_id', $catId))
                ->when($search, fn($q) => $q->where('description', 'like', "%{$search}%"))
                ->when($dateFrom, fn($q) => $q->whereDate('transaction_date', '>=', $dateFrom))
                ->when($dateTo, fn($q) => $q->whereDate('transaction_date', '<=', $dateTo))
                ->orderBy('transaction_date', 'desc');

            $page = $query->paginate($perPage);

            $items = $page->getCollection()->map(function ($trx) {
                $date = $trx->transaction_date ? $trx->transaction_date->format('j/n/Y') : null;
                $typeLabel = $trx->category ? ucfirst($trx->category->type) : null;
                $amount = (float) $trx->amount;
                
                if ($trx->category && $trx->category->type === 'expense') {
                    $amount = -1 * abs($amount);
                }

                return [
                    'id' => (int) $trx->id,
                    'date' => $date,
                    'type' => $typeLabel,
                    'category' => $trx->category?->category_name,
                    'description' => $trx->description,
                    'amount' => $amount,
                    'details' => $trx->transactionDetails->map(fn($d) => [
                        'id' => $d->id,
                        'item_name' => $d->item_name,
                        'quantity' => $d->quantity,
                        'item_price' => (float) $d->item_price,
                        'subtotal' => (float) $d->subtotal,
                        'category' => $d->category?->category_name,
                    ]),
                ];
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Transactions fetched with details',
                'data'    => $items,
                'meta'    => [
                    'current_page' => $page->currentPage(),
                    'per_page'     => $page->perPage(),
                    'total'        => $page->total(),
                    'last_page'    => $page->lastPage(),
                ],
            ]);
        }

        // Original query builder approach for backward compatibility
        $query = DB::table('transactions as T')
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

        // Map to History.jsx expected format
        $items = collect($page->items())->map(function ($row) {
            $date = null;
            if (!empty($row->transaction_date)) {
                try {
                    $date = \Carbon\Carbon::parse($row->transaction_date)->format('j/n/Y');
                } catch (\Throwable $e) {
                    $date = $row->transaction_date;
                }
            }

            $typeLabel = isset($row->type) ? ucfirst($row->type) : null;
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
    
    // GET /api/transactions/{id} - Get single transaction with details
    public function show(Request $request, $id)
    {
        try {
            $transaction = Transaction::with(['category', 'transactionDetails.category'])
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'transaction_id' => (int) $transaction->id,
                    'user_id' => (int) $transaction->user_id,
                    'category_id' => (int) $transaction->category_id,
                    'category_name' => $transaction->category->category_name,
                    'category_type' => $transaction->category->type,
                    'amount' => (float) $transaction->amount,
                    'description' => $transaction->description,
                    'transaction_date' => $transaction->transaction_date?->format('Y-m-d'),
                    'created_at' => $transaction->created_at?->toIso8601String(),
                    'updated_at' => $transaction->updated_at?->toIso8601String(),
                    'details' => $transaction->transactionDetails->map(fn($d) => [
                        'id' => $d->id,
                        'item_name' => $d->item_name,
                        'quantity' => $d->quantity,
                        'item_price' => (float) $d->item_price,
                        'subtotal' => (float) $d->subtotal,
                        'category_id' => $d->category_id,
                        'category_name' => $d->category?->category_name,
                    ]),
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaction not found or unauthorized.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching the transaction.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
    // PUT /api/transactions/{id}
    public function update(StoreTransactionRequest $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You can only update your own transactions.'
                ], 403);
            }

            $payload = $request->validated();
            
            DB::transaction(function () use ($transaction, $payload, $request) {
                // Update the transaction
                $transaction->update($payload);
                
                // Handle transaction details if provided
                if ($request->has('transaction_details') && is_array($request->transaction_details)) {
                    // Delete existing details
                    $transaction->transactionDetails()->delete();
                    
                    $totalAmount = 0;
                    
                    // Create new details
                    foreach ($request->transaction_details as $detail) {
                        $transactionDetail = $transaction->transactionDetails()->create([
                            'category_id' => $detail['category_id'] ?? $payload['category_id'],
                            'item_name' => $detail['item_name'],
                            'quantity' => $detail['quantity'] ?? 1,
                            'item_price' => $detail['item_price'],
                            // subtotal will be calculated automatically by the model
                        ]);
                        $totalAmount += $transactionDetail->subtotal;
                    }
                    
                    // Update transaction amount with calculated total from details
                    if ($totalAmount > 0) {
                        $transaction->update(['amount' => $totalAmount]);
                    }
                }
            });

            $transaction->refresh()->load('transactionDetails');

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
                    'details'          => $transaction->transactionDetails->map(fn($d) => [
                        'id' => $d->id,
                        'item_name' => $d->item_name,
                        'quantity' => $d->quantity,
                        'item_price' => (float) $d->item_price,
                        'subtotal' => (float) $d->subtotal,
                    ]),
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
            
            if ($transaction->user_id !== $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized. You can only delete your own transactions.'
                ], 403);
            }

            $deletedTransactionData = [
                'transaction_id'   => $transaction->id,
                'user_id'          => $transaction->user_id,
                'category_id'      => $transaction->category_id,
                'amount'           => (float) $transaction->amount,
                'description'      => $transaction->description,
                'transaction_date' => $transaction->transaction_date?->toIso8601String(),
            ];

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
            $totalIncome = DB::table('transactions as T')
                ->join('categories as C', 'T.category_id', '=', 'C.id')
                ->where('T.user_id', $userId)
                ->where('C.type', 'income')
                ->whereMonth('T.transaction_date', $month)
                ->whereYear('T.transaction_date', $year)
                ->sum('T.amount');

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
            'transaction_details' => 'nullable|array',
            'transaction_details.*.item_name' => 'required_with:transaction_details|string|max:255',
            'transaction_details.*.quantity' => 'nullable|integer|min:1',
            'transaction_details.*.item_price' => 'required_with:transaction_details|numeric|min:0',
            'transaction_details.*.category_id' => 'nullable|exists:categories,id',
        ]);

        $transaction = DB::transaction(function () use ($request, $validated) {
            // Create the transaction
            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'category_id' => $validated['category_id'],
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? '',
                'transaction_date' => $validated['transaction_date'],
            ]);
            
            // Handle transaction details if provided
            if (isset($validated['transaction_details']) && is_array($validated['transaction_details'])) {
                $totalAmount = 0;
                
                foreach ($validated['transaction_details'] as $detail) {
                    $transactionDetail = $transaction->transactionDetails()->create([
                        'category_id' => $detail['category_id'] ?? $validated['category_id'],
                        'item_name' => $detail['item_name'],
                        'quantity' => $detail['quantity'] ?? 1,
                        'item_price' => $detail['item_price'],
                        // subtotal will be calculated automatically by the model
                    ]);
                    $totalAmount += $transactionDetail->subtotal;
                }
                
                // Update transaction amount with calculated total from details
                if ($totalAmount > 0) {
                    $transaction->update(['amount' => $totalAmount]);
                }
            }
            
            return $transaction->load('transactionDetails');
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction created successfully',
            'data' => [
                'transaction_id' => (int) $transaction->id,
                'user_id' => (int) $transaction->user_id,
                'category_id' => (int) $transaction->category_id,
                'amount' => (float) $transaction->amount,
                'description' => $transaction->description,
                'transaction_date' => $transaction->transaction_date?->toIso8601String(),
                'created_at' => $transaction->created_at?->toIso8601String(),
                'details' => $transaction->transactionDetails->map(fn($d) => [
                    'id' => $d->id,
                    'item_name' => $d->item_name,
                    'quantity' => $d->quantity,
                    'item_price' => (float) $d->item_price,
                    'subtotal' => (float) $d->subtotal,
                ]),
            ]
        ], 201);
    }

    // POST /api/transactions/quick-add (for ScanReceipt.jsx)
    public function quickAdd(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
            'transaction_details' => 'nullable|array',
            'transaction_details.*.item_name' => 'required_with:transaction_details|string|max:255',
            'transaction_details.*.quantity' => 'nullable|integer|min:1',
            'transaction_details.*.item_price' => 'required_with:transaction_details|numeric|min:0',
            'transaction_details.*.category_id' => 'nullable|exists:categories,id',
        ]);

        try {
            // Check if the category is an expense category
            $category = \App\Models\Category::findOrFail($validated['category_id']);
            
            $transaction = DB::transaction(function () use ($request, $validated) {
                // Create the transaction
                $transaction = Transaction::create([
                    'user_id' => $request->user()->id,
                    'category_id' => $validated['category_id'],
                    'amount' => $validated['amount'],
                    'description' => $validated['description'] ?? 'Receipt transaction',
                    'transaction_date' => $validated['transaction_date'],
                ]);
                
                // Handle transaction details if provided
                if (isset($validated['transaction_details']) && is_array($validated['transaction_details'])) {
                    $totalAmount = 0;
                    
                    foreach ($validated['transaction_details'] as $detail) {
                        $transactionDetail = $transaction->transactionDetails()->create([
                            'category_id' => $detail['category_id'] ?? $validated['category_id'],
                            'item_name' => $detail['item_name'],
                            'quantity' => $detail['quantity'] ?? 1,
                            'item_price' => $detail['item_price'],
                            // subtotal will be calculated automatically by the model
                        ]);
                        $totalAmount += $transactionDetail->subtotal;
                    }
                    
                    // Update transaction amount with calculated total from details
                    if ($totalAmount > 0) {
                        $transaction->update(['amount' => $totalAmount]);
                    }
                }
                
                return $transaction->load('category', 'transactionDetails');
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction added successfully from receipt',
                'data' => [
                    'transaction_id' => (int) $transaction->id,
                    'user_id' => (int) $transaction->user_id,
                    'category_id' => (int) $transaction->category_id,
                    'category_name' => $transaction->category->category_name,
                    'category_type' => $transaction->category->type,
                    'amount' => (float) $transaction->amount,
                    'description' => $transaction->description,
                    'transaction_date' => $transaction->transaction_date?->toIso8601String(),
                    'created_at' => $transaction->created_at?->toIso8601String(),
                    'details' => $transaction->transactionDetails->map(fn($d) => [
                        'id' => $d->id,
                        'item_name' => $d->item_name,
                        'quantity' => $d->quantity,
                        'item_price' => (float) $d->item_price,
                        'subtotal' => (float) $d->subtotal,
                    ]),
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add transaction from receipt',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/transactions/history - Historical transactions with enhanced filtering
     */
    public function history(Request $request)
    {
        $validated = $request->validate([
            'type'            => ['nullable', 'in:income,expense'],
            'category_id'     => ['nullable', 'integer'],
            'search'          => ['nullable', 'string', 'max:255'],
            'date_from'       => ['nullable', 'date'],
            'date_to'         => ['nullable', 'date'],
            'per_page'        => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_details' => ['nullable', 'boolean'],
            'sort_by'         => ['nullable', 'in:date,amount,category'],
            'sort_order'      => ['nullable', 'in:asc,desc'],
            'year'            => ['nullable', 'integer', 'min:2020', 'max:2050'],
            'month'           => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $userId         = $request->user()->id;
        $type           = $validated['type']            ?? null;
        $categoryId     = $validated['category_id']     ?? null;
        $search         = $validated['search']          ?? null;
        $dateFrom       = $validated['date_from']       ?? null;
        $dateTo         = $validated['date_to']         ?? null;
        $perPage        = $validated['per_page']        ?? 20;
        $includeDetails = $validated['include_details'] ?? false;
        $sortBy         = $validated['sort_by']         ?? 'date';
        $sortOrder      = $validated['sort_order']      ?? 'desc';
        $year           = $validated['year']            ?? null;
        $month          = $validated['month']           ?? null;

        try {
            // Build the base query with eager loading
            $query = Transaction::with(['category', 'user'])
                ->where('user_id', $userId);

            // Apply category_id filter if provided
            if ($categoryId !== null) {
                $query->where('category_id', $categoryId);
            }

            // Apply type filter (via category relationship)
            if ($type !== null) {
                $query->whereHas('category', function($q) use ($type) {
                    $q->where('type', $type);
                });
            }

            // Apply search filter (description and category name)
            if ($search !== null) {
                $query->where(function($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhereHas('category', function($categoryQuery) use ($search) {
                          $categoryQuery->where('category_name', 'like', "%{$search}%");
                      });
                });
            }

            // Apply date range filters
            if ($dateFrom !== null) {
                $query->whereDate('transaction_date', '>=', $dateFrom);
            }
            if ($dateTo !== null) {
                $query->whereDate('transaction_date', '<=', $dateTo);
            }

            // Apply year/month filters for historical analysis
            if ($year !== null) {
                $query->whereYear('transaction_date', $year);
            }
            if ($month !== null) {
                $query->whereMonth('transaction_date', $month);
            }

            // Include transaction details if requested
            if ($includeDetails) {
                $query->with(['transactionDetails']);
            }

            // Apply sorting
            switch ($sortBy) {
                case 'amount':
                    $query->orderBy('amount', $sortOrder);
                    break;
                case 'category':
                    $query->join('categories', 'transactions.category_id', '=', 'categories.id')
                          ->orderBy('categories.category_name', $sortOrder)
                          ->select('transactions.*'); // Ensure we only select transaction fields
                    break;
                case 'date':
                default:
                    $query->orderBy('transaction_date', $sortOrder);
                    break;
            }

            // Secondary sort by ID for consistency
            $query->orderBy('id', 'desc');

            // Paginate results
            $page = $query->paginate($perPage);

            // Transform the data with historical context
            $items = $page->getCollection()->map(function ($trx) use ($includeDetails) {
                $date = $trx->transaction_date ? $trx->transaction_date->format('j/n/Y') : null;
                $isoDate = $trx->transaction_date ? $trx->transaction_date->toISOString() : null;
                $typeLabel = $trx->category ? ucfirst($trx->category->type) : null;
                $categoryName = $trx->category ? $trx->category->category_name : null;
                
                // Make expense amounts negative for frontend display
                $amount = (float) $trx->amount;
                $originalAmount = $amount; // Keep original for calculations
                if ($trx->category && $trx->category->type === 'expense') {
                    $amount = -$amount;
                }

                $item = [
                    'id'              => (int) $trx->id,
                    'date'            => $date,
                    'iso_date'        => $isoDate,
                    'type'            => $typeLabel,
                    'category'        => $categoryName,
                    'category_id'     => $trx->category_id,
                    'description'     => $trx->description,
                    'amount'          => $amount,
                    'original_amount' => $originalAmount,
                    'year'            => $trx->transaction_date ? $trx->transaction_date->year : null,
                    'month'           => $trx->transaction_date ? $trx->transaction_date->month : null,
                    'created_at'      => $trx->created_at ? $trx->created_at->toISOString() : null,
                ];

                // Include transaction details if requested
                if ($includeDetails && $trx->transactionDetails) {
                    $item['details'] = $trx->transactionDetails->map(function ($detail) {
                        return [
                            'id'         => $detail->id,
                            'item_name'  => $detail->item_name,
                            'quantity'   => $detail->quantity,
                            'item_price' => (float) $detail->item_price,
                            'subtotal'   => (float) $detail->subtotal,
                        ];
                    });
                }

                return $item;
            });

            // Calculate summary statistics for the filtered results
            $totalIncome = $page->getCollection()
                ->filter(fn($trx) => $trx->category && $trx->category->type === 'income')
                ->sum('amount');
            
            $totalExpense = $page->getCollection()
                ->filter(fn($trx) => $trx->category && $trx->category->type === 'expense')
                ->sum('amount');

            return response()->json([
                'status'  => 'success',
                'message' => 'Transaction history retrieved successfully',
                'data'    => $items,
                'summary' => [
                    'total_income'      => (float) $totalIncome,
                    'total_expense'     => (float) $totalExpense,
                    'net_amount'        => (float) ($totalIncome - $totalExpense),
                    'transaction_count' => $page->total(),
                ],
                'meta'    => [
                    'current_page' => $page->currentPage(),
                    'last_page'    => $page->lastPage(),
                    'per_page'     => $page->perPage(),
                    'total'        => $page->total(),
                    'from'         => $page->firstItem(),
                    'to'          => $page->lastItem(),
                ],
                'filters' => [
                    'category_id' => $categoryId,
                    'type'        => $type,
                    'search'      => $search,
                    'date_from'   => $dateFrom,
                    'date_to'     => $dateTo,
                    'year'        => $year,
                    'month'       => $month,
                    'sort_by'     => $sortBy,
                    'sort_order'  => $sortOrder,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch transaction history',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
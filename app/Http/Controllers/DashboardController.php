<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Category;

class DashboardController extends Controller
{
    /**
     * Get monthly statistics for the last 6 months
     * GET /api/dashboard/monthly-stats
     */
    public function monthlyStats(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $monthlyData = [];
            
            // Generate last 6 months including current month
            for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $month = $date->month;
            $year = $date->year;
            
            // Get income for this month
            $income = DB::table('transactions as T')
                ->join('categories as C', 'T.category_id', '=', 'C.id')
                ->where('T.user_id', $userId)
                ->where('C.type', 'income')
                ->whereMonth('T.transaction_date', $month)
                ->whereYear('T.transaction_date', $year)
                ->sum('T.amount') ?? 0;

            // Get expenses for this month
            $expenses = DB::table('transactions as T')
                ->join('categories as C', 'T.category_id', '=', 'C.id')
                ->where('T.user_id', $userId)
                ->where('C.type', 'expense')
                ->whereMonth('T.transaction_date', $month)
                ->whereYear('T.transaction_date', $year)
                ->sum('T.amount') ?? 0;

            $monthlyData[] = [
                'month' => $date->format('M'),
                'year' => $year,
                'fullDate' => $date->format('Y-m'),
                'income' => (float) $income,
                'expenses' => (float) $expenses
            ];
        }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'monthlyData' => $monthlyData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch monthly statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get financial overview (totals, balance, budget progress)
     * GET /api/dashboard/financial-overview
     */
    public function financialOverview(Request $request)
    {
        try {
            $userId = $request->user()->id;

        // Get total income (all time)
        $totalIncome = DB::table('transactions as T')
            ->join('categories as C', 'T.category_id', '=', 'C.id')
            ->where('T.user_id', $userId)
            ->where('C.type', 'income')
            ->sum('T.amount') ?? 0;

        // Get total expenses (all time)
        $totalExpenses = DB::table('transactions as T')
            ->join('categories as C', 'T.category_id', '=', 'C.id')
            ->where('T.user_id', $userId)
            ->where('C.type', 'expense')
            ->sum('T.amount') ?? 0;

        // Calculate current balance
        $currentBalance = $totalIncome - $totalExpenses;

        // Calculate budget progress for current month
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        // Get current month's expenses by category
        $monthlyExpensesByCategory = DB::table('transactions as T')
            ->join('categories as C', 'T.category_id', '=', 'C.id')
            ->where('T.user_id', $userId)
            ->where('C.type', 'expense')
            ->whereMonth('T.transaction_date', $currentMonth)
            ->whereYear('T.transaction_date', $currentYear)
            ->groupBy('C.id')
            ->selectRaw('C.id, SUM(T.amount) as spent')
            ->pluck('spent', 'id')
            ->toArray();

        // Get active budgets for current month
        $activeBudgets = Budget::where('user_id', $userId)
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->get();

        $budgetProgress = 0;
        if ($activeBudgets->count() > 0) {
            $totalBudgetAmount = $activeBudgets->sum('amount');
            $totalSpent = 0;
            
            foreach ($activeBudgets as $budget) {
                $spent = $monthlyExpensesByCategory[$budget->category_id] ?? 0;
                $totalSpent += $spent;
            }
            
            $budgetProgress = $totalBudgetAmount > 0 ? min(100, ($totalSpent / $totalBudgetAmount) * 100) : 0;
        }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'totalIncome' => (float) $totalIncome,
                    'totalExpenses' => (float) $totalExpenses,
                    'currentBalance' => (float) $currentBalance,
                    'budgetProcess' => round($budgetProgress, 0)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch financial overview',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get expense categories breakdown for current month
     * GET /api/dashboard/expense-categories
     */
    public function expenseCategories(Request $request)
    {
        try {
            $userId = $request->user()->id;
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Get expenses by category for current month
        $expensesByCategory = DB::table('transactions as T')
            ->join('categories as C', 'T.category_id', '=', 'C.id')
            ->where('T.user_id', $userId)
            ->where('C.type', 'expense')
            ->whereMonth('T.transaction_date', $currentMonth)
            ->whereYear('T.transaction_date', $currentYear)
            ->groupBy('C.id', 'C.category_name')
            ->selectRaw('C.category_name, SUM(T.amount) as total')
            ->orderByDesc('total')
            ->get();

        $totalExpenses = $expensesByCategory->sum('total');
        
        // Define colors for categories (cycle through these)
        $colors = [
            '#EF4444', // red
            '#3B82F6', // blue
            '#F59E0B', // amber
            '#8B5CF6', // purple
            '#10B981', // emerald
            '#F97316', // orange
            '#06B6D4', // cyan
            '#84CC16', // lime
            '#EC4899', // pink
            '#6366F1'  // indigo
        ];

        $expenseCategories = [];
        $colorIndex = 0;
        
        foreach ($expensesByCategory as $expense) {
            $percentage = $totalExpenses > 0 ? ($expense->total / $totalExpenses) * 100 : 0;
            
            $expenseCategories[] = [
                'name' => $expense->category_name,
                'percentage' => round($percentage, 2),
                'color' => $colors[$colorIndex % count($colors)]
            ];
            
            $colorIndex++;
        }

        // If no expenses, show placeholder data
        if (empty($expenseCategories)) {
            $expenseCategories = [
                [
                    'name' => 'No expenses yet',
                    'percentage' => 100.0,
                    'color' => '#9CA3AF'
                ]
            ];
        }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'expenseCategories' => $expenseCategories
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch expense categories',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get complete dashboard data in one request
     * GET /api/dashboard/complete
     */
    public function completeData(Request $request)
    {
        try {
            // Get all data in one call to reduce API calls from frontend
            $monthlyStats = $this->monthlyStats($request);
            $financialOverview = $this->financialOverview($request);
            $expenseCategories = $this->expenseCategories($request);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'monthlyData' => $monthlyStats->getData()->data->monthlyData,
                    'financialOverview' => $financialOverview->getData()->data,
                    'expenseCategories' => $expenseCategories->getData()->data->expenseCategories
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
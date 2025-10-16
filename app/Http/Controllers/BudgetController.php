<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();
        $month = $request->get('month', $now->format('m'));
        $year = $request->get('year', $now->year);
        
        $month = str_pad($month, 2, '0', STR_PAD_LEFT);
        
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $userId = Auth::id(); // This is correct
        
        $budgets = Budget::where('user_id', $userId)
            ->whereYear('start_date', $year)
            ->whereMonth('start_date', $month)
            ->with('category')
            ->get()
            // FIXED: Added $userId to the `use` statement
            ->map(function ($budget) use ($startDate, $endDate, $userId) { 
                $spent = Transaction::where('user_id', $userId)
                    ->where('category_id', $budget->category_id)
                    ->whereBetween('transaction_date', [$startDate, $endDate])
                    ->sum('amount');
                
                return [
                    'id' => $budget->id,
                    'title' => $budget->category->category_name,
                    'category' => $budget->category->category_name,
                    'budget' => (float) $budget->amount,
                    'spent' => (float) abs($spent),
                    'month' => $budget->start_date->format('m'),
                    'year' => (int) $budget->start_date->year,
                ];
            })->values()->toArray();
        
        $categories = Category::where('type', 'expense')
            ->pluck('category_name')
            ->values()
            ->toArray();
        
        return Inertia::render('Budget', [
            'budgets' => $budgets,
            'categories' => $categories,
            'selectedMonth' => $month,
            'selectedYear' => (int) $year,
            'isCurrentMonth' => $startDate->isSameMonth($now),
            'currentMonth' => $now->format('m'),
            'currentYear' => (int) $now->year,
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'budget' => 'required|numeric|min:0',
        ]);
        
        $category = Category::where('category_name', $request->category)
            ->where('type', 'expense')
            ->first();
        
        if (!$category) {
            return back()->withErrors(['category' => 'Category not found.']);
        }
        
        $now = Carbon::now();
        $startDate = $now->copy()->startOfMonth();
        $endDate = $now->copy()->endOfMonth();
        
        $userId = Auth::id(); // FIXED: Added this line
        
        $exists = Budget::where('user_id', $userId)
            ->where('category_id', $category->id)
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->exists();
        
        if ($exists) {
            return back()->withErrors(['category' => 'Budget for this category already exists for the current month.']);
        }
        
        Budget::create([
            'user_id' => $userId,
            'category_id' => $category->id,
            'amount' => $request->budget,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        
        return redirect()->route('budget')->with('success', 'Budget created successfully!');
    }
    
    public function update(Request $request, Budget $budget)
    {
        $userId = Auth::id(); // FIXED: Added this line
        
        if ($budget->user_id !== $userId) {
            abort(403);
        }

        $request->validate([
            'category' => 'required|string',
            'budget' => 'required|numeric|min:0',
        ]);

        $category = Category::where('category_name', $request->category)
            ->where('type', 'expense')
            ->first();

        if (!$category) {
            return back()->withErrors(['category' => 'Category not found.']);
        }

        $exists = Budget::where('user_id', $userId)
            ->where('category_id', $category->id)
            ->where('id', '!=', $budget->id)
            ->whereYear('start_date', $budget->start_date->year)
            ->whereMonth('start_date', $budget->start_date->month)
            ->exists();

        if ($exists) {
            return back()->withErrors(['category' => 'Budget for this category already exists for this month.']);
        }

        $budget->update([
            'category_id' => $category->id,
            'amount' => $request->budget,
        ]);

        return redirect()->route('budget')->with('success', 'Budget updated successfully!');
    }
    
    public function destroy(Budget $budget)
    {
        $userId = Auth::id(); // FIXED: Added this line
        
        if ($budget->user_id !== $userId) {
            abort(403);
        }
        
        if (!$budget->start_date->isSameMonth(now())) {
            return back()->withErrors(['error' => 'Cannot delete past budgets.']);
        }
        
        $budget->delete();
        
        return redirect()->route('budget')->with('success', 'Budget deleted successfully!');
    }

    public function checkBudget(Request $request)
    {
        $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $userId = Auth::id(); // FIXED: Added this line

        $budgetExists = Budget::where('user_id', $userId)
            ->where('category_id', $request->category_id)
            ->whereYear('start_date', $request->year)
            ->whereMonth('start_date', $request->month)
            ->exists();

        return response()->json([
            'has_budget' => $budgetExists,
        ]);
    }
}
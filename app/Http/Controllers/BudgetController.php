<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

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
        
        $budgets = Budget::where('user_id', auth()->id())
            ->whereYear('start_date', $year)
            ->whereMonth('start_date', $month)
            ->with('category')
            ->get()
            ->map(function ($budget) use ($startDate, $endDate) {
                // Calculate spent for this budget's category within the date range
                $spent = Transaction::where('user_id', auth()->id())
                    ->where('category_id', $budget->category_id)
                    ->whereBetween('transaction_date', [$startDate, $endDate])
                    ->sum('amount');
                
                return [
                    'id' => $budget->id,
                    'title' => $budget->category->category_name,
                    'category' => $budget->category->category_name,
                    'budget' => (float) $budget->amount,
                    'spent' => (float) abs($spent), // Use abs() in case amounts are negative
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
        
        $exists = Budget::where('user_id', auth()->id())
            ->where('category_id', $category->id)
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->exists();
        
        if ($exists) {
            return back()->withErrors(['category' => 'Budget for this category already exists for the current month.']);
        }
        
        Budget::create([
            'user_id' => auth()->id(),
            'category_id' => $category->id,
            'amount' => $request->budget,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
        
        return redirect()->route('budget')->with('success', 'Budget created successfully!');
    }
    
    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'category' => 'required|string',
            'budget' => 'required|numeric|min:0',
        ]);

        // Find the category by name
        $category = Category::where('category_name', $request->category)
            ->where('type', 'expense')
            ->first();

        if (!$category) {
            return back()->withErrors(['category' => 'Category not found.']);
        }

        // Check if budget already exists for this category in the same month
        $exists = Budget::where('user_id', auth()->id())
            ->where('category_id', $category->id)
            ->where('id', '!=', $budget->id) // Exclude current budget
            ->whereYear('start_date', $budget->start_date->year)
            ->whereMonth('start_date', $budget->start_date->month)
            ->exists();

        if ($exists) {
            return back()->withErrors(['category' => 'Budget for this category already exists for this month.']);
        }

        // Update the budget
        $budget->update([
            'category_id' => $category->id,
            'amount' => $request->budget,
        ]);

        return redirect()->route('budget')->with('success', 'Budget updated successfully!');
    }
    
    public function destroy(Budget $budget)
    {
        if ($budget->user_id !== auth()->id()) {
            abort(403);
        }
        
        if (!$budget->start_date->isSameMonth(now())) {
            return back()->withErrors(['error' => 'Cannot delete past budgets.']);
        }
        
        $budget->delete();
        
        return redirect()->route('budget')->with('success', 'Budget deleted successfully!');
    }
}

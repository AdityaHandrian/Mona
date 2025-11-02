<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class BudgetAlertService
{
    const ALERT_THRESHOLD = 85; // 85% threshold for alerts

    /**
     * Check if any budgets have reached the alert threshold for the given user
     *
     * @param int $userId
     * @param int|null $categoryId Optional - check specific category only
     * @return array Array of budget alerts
     */
    public function checkBudgetAlerts($userId, $categoryId = null)
    {
        $now = Carbon::now();
        $startDate = $now->copy()->startOfMonth();
        $endDate = $now->copy()->endOfMonth();

        $query = Budget::where('user_id', $userId)
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->with('category');

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        $budgets = $query->get();
        $alerts = [];

        foreach ($budgets as $budget) {
            $spent = Transaction::where('user_id', $userId)
                ->where('category_id', $budget->category_id)
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->sum('amount');

            $spentAmount = abs($spent);
            $budgetAmount = $budget->amount;
            
            if ($budgetAmount > 0) {
                $percentage = ($spentAmount / $budgetAmount) * 100;

                // Alert if spending is at or above threshold
                if ($percentage >= self::ALERT_THRESHOLD) {
                    $alerts[] = [
                        'budget_id' => $budget->id,
                        'category_id' => $budget->category_id,
                        'category_name' => $budget->category->category_name,
                        'budget_amount' => (float) $budgetAmount,
                        'spent_amount' => (float) $spentAmount,
                        'percentage' => round($percentage, 2),
                        'remaining' => (float) ($budgetAmount - $spentAmount),
                        'is_exceeded' => $percentage >= 100,
                        'alert_level' => $this->getAlertLevel($percentage),
                        'message' => $this->getAlertMessage($budget->category->category_name, $percentage),
                    ];
                }
            }
        }

        return $alerts;
    }

    /**
     * Get alert level based on percentage
     *
     * @param float $percentage
     * @return string
     */
    private function getAlertLevel($percentage)
    {
        if ($percentage >= 100) {
            return 'critical'; // Over budget
        } elseif ($percentage >= 95) {
            return 'high'; // Very close to budget
        } elseif ($percentage >= 85) {
            return 'warning'; // Approaching budget limit
        }
        return 'normal';
    }

    /**
     * Get alert message based on category and percentage
     *
     * @param string $categoryName
     * @param float $percentage
     * @return string
     */
    private function getAlertMessage($categoryName, $percentage)
    {
        $roundedPercentage = round($percentage, 0);

        if ($percentage >= 100) {
            return "You have exceeded your {$categoryName} budget by " . round($percentage - 100, 0) . "%!";
        } elseif ($percentage >= 95) {
            return "Your {$categoryName} budget is almost full ({$roundedPercentage}%)!";
        } elseif ($percentage >= 85) {
            return "Warning: Your {$categoryName} budget is at {$roundedPercentage}%.";
        }
        
        return "Your {$categoryName} budget is at {$roundedPercentage}%.";
    }

    /**
     * Check a specific category budget and return alert if threshold reached
     *
     * @param int $userId
     * @param int $categoryId
     * @return array|null
     */
    public function checkCategoryBudget($userId, $categoryId)
    {
        $alerts = $this->checkBudgetAlerts($userId, $categoryId);
        return !empty($alerts) ? $alerts[0] : null;
    }

    /**
     * Get all active budget alerts count for a user
     *
     * @param int $userId
     * @return int
     */
    public function getAlertCount($userId)
    {
        return count($this->checkBudgetAlerts($userId));
    }
}

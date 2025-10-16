<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\User;
use App\Models\Budget;
use Carbon\Carbon;

class DashboardDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (or create one if none exists)
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
            ]);
        }

        // Create sample categories if they don't exist
        $incomeCategories = [
            ['category_name' => 'Salary', 'type' => 'income'],
            ['category_name' => 'Freelance', 'type' => 'income'],
            ['category_name' => 'Investment', 'type' => 'income'],
            ['category_name' => 'Business', 'type' => 'income'],
        ];

        $expenseCategories = [
            ['category_name' => 'Food', 'type' => 'expense'],
            ['category_name' => 'Transport', 'type' => 'expense'],
            ['category_name' => 'Entertainment', 'type' => 'expense'],
            ['category_name' => 'Utilities', 'type' => 'expense'],
            ['category_name' => 'Healthcare', 'type' => 'expense'],
            ['category_name' => 'Shopping', 'type' => 'expense'],
            ['category_name' => 'Education', 'type' => 'expense'],
            ['category_name' => 'Others', 'type' => 'expense'],
        ];

        // Create categories
        foreach (array_merge($incomeCategories, $expenseCategories) as $categoryData) {
            Category::firstOrCreate(
                ['category_name' => $categoryData['category_name'], 'type' => $categoryData['type']],
                $categoryData
            );
        }

        // Get created categories
        $incomeCategs = Category::where('type', 'income')->get();
        $expenseCategs = Category::where('type', 'expense')->get();

        // Generate sample transactions for the last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            
            // Generate 15-25 transactions per month
            $transactionCount = rand(15, 25);
            
            for ($j = 0; $j < $transactionCount; $j++) {
                $isIncome = rand(1, 4) === 1; // 25% chance of income, 75% expense
                
                if ($isIncome && $incomeCategs->count() > 0) {
                    // Create income transaction
                    $category = $incomeCategs->random();
                    $amount = rand(1000000, 5000000); // 1M - 5M IDR
                } else if ($expenseCategs->count() > 0) {
                    // Create expense transaction
                    $category = $expenseCategs->random();
                    $amount = rand(50000, 1000000); // 50K - 1M IDR
                } else {
                    continue;
                }

                // Random day in the month
                $randomDay = rand(1, min(28, $month->daysInMonth));
                $transactionDate = $month->copy()->day($randomDay);

                Transaction::create([
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'amount' => $amount,
                    'description' => $this->generateDescription($category->category_name, $isIncome),
                    'transaction_date' => $transactionDate,
                ]);
            }
        }

        // Create sample budgets for current month
        $currentMonth = Carbon::now();
        $nextMonth = Carbon::now()->addMonth();

        foreach ($expenseCategs->take(5) as $category) {
            Budget::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'amount' => rand(500000, 2000000), // 500K - 2M IDR budget
                'start_date' => $currentMonth->startOfMonth(),
                'end_date' => $currentMonth->endOfMonth(),
            ]);
        }

        $this->command->info('Dashboard sample data created successfully!');
    }

    private function generateDescription($categoryName, $isIncome)
    {
        $incomeDescriptions = [
            'Salary' => ['Monthly salary', 'Bonus payment', 'Overtime pay'],
            'Freelance' => ['Web development project', 'Design consultation', 'Writing article'],
            'Investment' => ['Stock dividend', 'Mutual fund return', 'Crypto profit'],
            'Business' => ['Product sales', 'Service income', 'Commission'],
        ];

        $expenseDescriptions = [
            'Food' => ['Restaurant dinner', 'Grocery shopping', 'Coffee shop', 'Fast food'],
            'Transport' => ['Gas refill', 'Taxi fare', 'Bus ticket', 'Car maintenance'],
            'Entertainment' => ['Movie tickets', 'Concert', 'Gaming', 'Streaming subscription'],
            'Utilities' => ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill'],
            'Healthcare' => ['Doctor visit', 'Medicines', 'Health checkup', 'Dental care'],
            'Shopping' => ['Clothing', 'Electronics', 'Home goods', 'Personal items'],
            'Education' => ['Course fee', 'Books', 'Online course', 'Training'],
            'Others' => ['Miscellaneous expense', 'Emergency fund', 'Gift', 'Donation'],
        ];

        if ($isIncome && isset($incomeDescriptions[$categoryName])) {
            return $incomeDescriptions[$categoryName][array_rand($incomeDescriptions[$categoryName])];
        } elseif (!$isIncome && isset($expenseDescriptions[$categoryName])) {
            return $expenseDescriptions[$categoryName][array_rand($expenseDescriptions[$categoryName])];
        }

        return $isIncome ? 'Income transaction' : 'Expense transaction';
    }
}
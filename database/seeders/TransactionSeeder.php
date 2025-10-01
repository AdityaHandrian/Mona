<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $users = User::all();

        // Ensure there are categories
        $categories = Category::all();
        if ($categories->isEmpty()) {
            // create a couple of fallback categories (should normally be created by CategorySeeder)
            Category::create(["category_name" => "Uncategorized Income", "type" => "income"]);
            Category::create(["category_name" => "Uncategorized Expense", "type" => "expense"]);
            $categories = Category::all();
        }

        // Get users who don't have transactions yet (bulk check)
        $userIdsWithTransactions = Transaction::pluck('user_id')->unique()->toArray();
        $usersWithoutTransactions = $users->whereNotIn('id', $userIdsWithTransactions);

        if ($usersWithoutTransactions->isEmpty()) {
            $this->command->info('All users already have transactions. Skipping transaction creation.');
            return;
        }

        // Create sample transactions per user
        foreach ($usersWithoutTransactions as $user) {
            $this->command->info("Creating transactions for user: {$user->name}");

            // create 8 transactions per user (mix of income/expense)
            for ($i = 0; $i < 8; $i++) {
                Transaction::create([
                    'user_id' => $user->id,
                    'category_id' => $categories->random()->id,
                    'amount' => $faker->randomFloat(2, 5, 5000),
                    'description' => $faker->optional()->sentence(),
                    'transaction_date' => $faker->dateTimeBetween('-1 years', 'now')->format('Y-m-d H:i:s'),
                ]);
            }
        }
    }
}

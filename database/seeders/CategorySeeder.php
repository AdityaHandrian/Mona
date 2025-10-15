<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            // Income categories
            ['category_name' => 'Salary', 'type' => 'income'],
            ['category_name' => 'Freelance', 'type' => 'income'],
            ['category_name' => 'Investment', 'type' => 'income'],
            ['category_name' => 'Business', 'type' => 'income'],
            ['category_name' => 'Gift', 'type' => 'income'],
            ['category_name' => 'Other Income', 'type' => 'income'],
            
            // Expense categories
            ['category_name' => 'Food & Dining', 'type' => 'expense'],
            ['category_name' => 'Transportation', 'type' => 'expense'],
            ['category_name' => 'Entertainment', 'type' => 'expense'],
            ['category_name' => 'Shopping', 'type' => 'expense'],
            ['category_name' => 'Bills & Utilities', 'type' => 'expense'],
            ['category_name' => 'Healthcare', 'type' => 'expense'],
            ['category_name' => 'Education', 'type' => 'expense'],
            ['category_name' => 'Travel', 'type' => 'expense'],
            ['category_name' => 'Groceries', 'type' => 'expense'],
            ['category_name' => 'Personal Care', 'type' => 'expense'],
            ['category_name' => 'Other Expense', 'type' => 'expense'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['category_name' => $category['category_name'], 'type' => $category['type']],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}

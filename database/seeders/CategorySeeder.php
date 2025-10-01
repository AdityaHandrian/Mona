<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            ['category_name' => 'Salary', 'type' => 'income'],
            ['category_name' => 'Bonus', 'type' => 'income'],
            ['category_name' => 'Business Income', 'type' => 'income'],
            ['category_name' => 'Investment', 'type' => 'income'],
            ['category_name' => 'Gift', 'type' => 'income'],
            ['category_name' => 'Other Income', 'type' => 'income'],
            
            // Expense Categories
            ['category_name' => 'Food and Beverages', 'type' => 'expense'],
            ['category_name' => 'Transportation', 'type' => 'expense'],
            ['category_name' => 'Shopping', 'type' => 'expense'],
            ['category_name' => 'Entertainment', 'type' => 'expense'],
            ['category_name' => 'Bills and Utilities', 'type' => 'expense'],
            ['category_name' => 'Other Expense', 'type' => 'expense'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate($category);
        }
    }
}

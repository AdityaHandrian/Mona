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
        // Income Categories
        Category::create([
            "category_name"=> "Salary",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Bonus",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Business Income",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Investation",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Gift",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Other Income",
            "type"=> "income",
        ]);

        // Expense Categories
        Category::create([
            "category_name"=> "Food and Beverages",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Transportation",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Shopping",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Entertainment",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Bills and Utilities",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Other Expense",
            "type"=> "expense",
        ]);
    }
}

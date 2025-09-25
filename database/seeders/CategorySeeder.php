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
            "category_name"=> "Gaji",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Bonus",
            "type"=> "income",
        ]);

        // Expense Categories
        Category::create([
            "category_name"=> "Transportasi",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Makanan",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Hiburan",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Lainnya",
            "type"=> "expense",
        ]);
    }
}

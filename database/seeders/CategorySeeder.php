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
            "category_name"=> "Bonus & THR",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Pendapatan Usaha",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Pekerjaan Lepas (Freelance)",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Investasi",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Hadiah / Pemberian",
            "type"=> "income",
        ]);
        Category::create([
            "category_name"=> "Pendapatan Lainnya (Other Income)",
            "type"=> "income",
        ]);

        // Expense Categories
        Category::create([
            "category_name"=> "Kebutuhan Pokok",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Transportasi",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Kebutuhan Pribadi",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Gaya Hidup & Hiburan",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Keluarga & Sosial",
            "type"=> "expense",
        ]);
        Category::create([
            "category_name"=> "Lain-lain",
            "type"=> "expense",
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure there are users
        $users = User::all();
        if ($users->isEmpty()) {
            // create a few users if none exist
            $specificUser = User::create([
                'name'     => 'John Doe',
                'email'    => 'johndoe@example.com',
                'password' => bcrypt('password'), // Hash the password
            ]);
            $randomUsers = User::factory()->count(2)->create();

            // 3. Combine them into the $users variable
            // The concat() method is useful for merging Collections
            $users = $randomUsers->prepend($specificUser);
        }
    }
}

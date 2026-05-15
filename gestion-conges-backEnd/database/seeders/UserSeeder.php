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
        User::factory()->create([
            'name' => 'HR',
            'email' => 'admin@test.com',
            'role' => 'admin',
        ]);
        $managers = User::factory(3)->create(['role' => 'manager']);

        foreach ($managers as $manager) {
        User::factory(8)->create([
            'role' => 'employee',
            'manager_id' => $manager->id,
            'department_id' => $manager->department_id,
        ]);
    }
    }
}

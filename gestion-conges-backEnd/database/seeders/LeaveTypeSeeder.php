<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Annuelle',
                'default_quota' => 27,
                'is_paid' => true,
            ],
            [
                'name' => 'Maladie',
                'default_quota' => 20,
                'is_paid' => true,
            ],
            [
                'name' => 'Exceptionnelle',
                'default_quota' => 14,
                'is_paid' => true,
            ],
            [
                'name' => 'Sans Solde',
                'default_quota' => 0,
                'is_paid' => false,
            ],
        ];
      foreach ($types as $type) {
    LeaveType::updateOrCreate(['name' => $type['name']], $type);
}
    }
}

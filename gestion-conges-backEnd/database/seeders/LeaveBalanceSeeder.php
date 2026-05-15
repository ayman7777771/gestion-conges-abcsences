<?php

namespace Database\Seeders;

use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LeaveBalanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $leaveTypes = LeaveType::all();
        foreach ($users as $user) {
            foreach ($leaveTypes as $leaveType) {
                LeaveBalance::factory()->create([
                   'user_id' => $user->id,
                    'leave_type_id' => $leaveType->id,
                    'year' => 2026,            
                    'quota' => $leaveType->default_quota,
                ]);
            }
        }
    }
}

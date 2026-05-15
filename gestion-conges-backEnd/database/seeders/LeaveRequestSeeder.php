<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\LeaveType;
use App\Models\LeaveRequest;
use Illuminate\Database\Seeder;

class LeaveRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
public function run(): void
    {
        $managers = User::where('role', 'manager')->get();
        $types = LeaveType::all();

        User::where('role', 'employee')->get()->each(fn($e) => 
            LeaveRequest::factory(3)->create([
                'user_id' => $e->id,
                'leave_type_id' => $types->random()->id,
            ])->each(fn($req) => 
                $req->status !== 'pending' && $managers->isNotEmpty()
                    ? $req->update(['reviewed_by' => $managers->random()->id]) 
                    : null
            )
        );
    }
}
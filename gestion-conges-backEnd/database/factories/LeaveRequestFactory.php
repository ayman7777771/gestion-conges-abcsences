<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('now', '+1 month');
        $endDate = (clone $startDate)->modify('+'.fake()->numberBetween(3, 15).' days');
        return [
            'user_id' => User::factory(),
            'leave_type_id' =>LeaveType::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days_count' => $startDate->diff($endDate)->days,
            'reason' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'reviewed_by' => null,
        ];
    }
}

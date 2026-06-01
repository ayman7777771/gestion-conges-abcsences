<?php

namespace App\Services;

use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;

class LeaveBalanceService
{
    public function hasEnoughBalance(int $userId, int $leaveTypeId, int $days): bool
    {
        $leaveType = LeaveType::find($leaveTypeId);

        if ($leaveType && !$leaveType->is_paid) {
            return true;
        }

        $balance = LeaveBalance::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', now()->year)
            ->first();

        if (!$balance) {
            return false;
        }

        return $balance->remaining >= $days;
    }

    public function deduct(int $userId, int $leaveTypeId, int $days): void
    {
        LeaveBalance::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', now()->year)
            ->increment('used', $days);
    }

    public function restore(int $userId, int $leaveTypeId, int $days): void
    {
        LeaveBalance::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', now()->year)
            ->decrement('used', $days);
    }

    public function createForUser(User $user, ?int $year = null): void
    {
        $year ??= now()->year;

        LeaveType::query()->each(function (LeaveType $leaveType) use ($user, $year) {
            LeaveBalance::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'leave_type_id' => $leaveType->id,
                    'year' => $year,
                ],
                [
                    'quota' => $leaveType->default_quota,
                    'used' => 0,
                ]
            );
        });
    }

    public function createForLeaveType(LeaveType $leaveType, ?int $year = null): void
    {
        $year ??= now()->year;

        User::query()
            ->whereIn('role', ['employee', 'manager'])
            ->each(function (User $user) use ($leaveType, $year) {
                LeaveBalance::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'leave_type_id' => $leaveType->id,
                        'year' => $year,
                    ],
                    [
                        'quota' => $leaveType->default_quota,
                        'used' => 0,
                    ]
                );
            });
    }
}

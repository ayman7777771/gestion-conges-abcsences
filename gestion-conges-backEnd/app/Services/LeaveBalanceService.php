<?php

namespace App\Services;

use App\Models\LeaveBalance;

class LeaveBalanceService
{

    public function hasEnoughBalance(int $userId, int $leaveTypeId, int $days): bool
    {
        $balance = LeaveBalance::where('user_id', $userId)
            ->where('leave_type_id', $leaveTypeId)
            ->where('year', now()->year)
            ->first();

        if (!$balance) return false;
        if ($balance->remaining === 'Illimité') return true;
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
}
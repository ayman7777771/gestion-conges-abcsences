<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LeaveBalance;

class LeaveBalanceController extends Controller
{
    public function myBalances()
    {
        $balances = LeaveBalance::with('leaveType')
            ->where('user_id', auth()->id())
            ->where('year', now()->year)
            ->get();

        return response()->json($balances);
    }

    public function userBalances($id)
    {
        $user= User::findOrFail($id);
        $balances = LeaveBalance::with('leaveType')
            ->where('user_id', $user->id)
            ->where('year', now()->year)
            ->get();

        return response()->json($balances);
    }
}
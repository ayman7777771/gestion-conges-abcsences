<?php

namespace App\Services;

use App\Models\LeaveRequest;
use Carbon\Carbon;

class LeaveRequestService
{
    public function calcWorkDays(string $start, string $end)
    {
        $count   = 0;
        $curr = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        while ($curr->lte($endDate)) {
            if (!$curr->isWeekend()) {
                $count++;
            }
            $curr->addDay();
        }

        return $count;
    }

    public function hasconflit(int $userId, string $start, string $end)
    {
        return LeaveRequest::where('user_id', $userId)
            ->where('status', 'approved')
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('start_date', [$start, $end])
                      ->orWhereBetween('end_date', [$start, $end])
                      ->orWhere(function ($query) use ($start, $end) {
                          $query->where('start_date', '<=', $start)
                                ->where('end_date', '>=', $end);
                      });
            })->exists();
    }
}
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
 
    public function hasConflit(int $userId, string $start, string $end)
    {
        return LeaveRequest::where('user_id', $userId)
            ->where('status', 'approved')
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->exists();
    }
}
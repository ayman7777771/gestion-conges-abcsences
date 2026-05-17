<?php
namespace App\Actions;

use App\Models\LeaveRequest;
use App\Services\LeaveBalanceService;
    /**
     * Create a new class instance.
     */
class LeaveRequestAction
{
    public function __construct(
        private LeaveBalanceService $balanceService,
    ) {}

    public function approve(
        LeaveRequest $request,
        string $comment
    ): LeaveRequest {
        $updated = $request->markAsApproved($comment);

        $this->balanceService->deduct(
            $request->user_id,
            $request->leave_type_id,
            $request->days_count
        );

        return $updated;
    }

    public function reject(
        LeaveRequest $request,
        string $comment
    ): LeaveRequest {
        return $request->markAsRejected($comment);
    }

    public function cancel(
        LeaveRequest $request
    ): LeaveRequest {
        if (!in_array($request->status, ['pending', 'approved'])) {
            throw new \Exception('Cette demande ne peut pas être annulée.');
        }

        if ($request->status === 'approved') {
            $this->balanceService->restore(
                $request->user_id,
                $request->leave_type_id,
                $request->days_count
            );
        }

        return $request->markAsCancelled();
    }
}
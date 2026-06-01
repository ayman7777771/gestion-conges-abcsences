<?php

namespace App\Actions;

use App\Models\LeaveRequest;
use App\Services\LeaveBalanceService;
use App\Services\LeaveRequestService;
use App\Services\NotificationService;
use Illuminate\Validation\ValidationException;

class LeaveRequestAction
{
    public function __construct(
        private LeaveBalanceService $balanceService,
        private LeaveRequestService $leaveRequestService,
        private NotificationService $notificationService
    ) {
    }

    public function approve(LeaveRequest $leaveRequest, ?string $comment = null)
    {
        if (!$this->balanceService->hasEnoughBalance(
            $leaveRequest->user_id,
            $leaveRequest->leave_type_id,
            $leaveRequest->days_count
        )) {
            throw ValidationException::withMessages([
                'balance' => 'Solde insuffisant pour approuver cette demande.',
            ]);
        }

        $this->balanceService->deduct(
            $leaveRequest->user_id,
            $leaveRequest->leave_type_id,
            $leaveRequest->days_count
        );

        $updated = $leaveRequest->markAsApproved($comment);
        $this->notificationService->notifyEmployeeOnApproval($updated);

        return $updated->load(['user', 'leaveType']);
    }

    public function reject(LeaveRequest $leaveRequest, string $comment)
    {
        $updated = $leaveRequest->markAsRejected($comment);
        $this->notificationService->notifyEmployeeOnRejection($updated);

        return $updated->load(['user', 'leaveType']);
    }

    public function cancel(LeaveRequest $request): array
    {
        if ($request->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Cette demande ne peut pas être annulée.',
            ]);
        }

        $updated = $request->markAsCancelled();
        $notification = $this->notificationService->notifyManagerOnCancellation(
            $updated->load('user.manager')
        );

        return [
            'request' => $updated->load(['user', 'leaveType']),
            'notification' => $notification,
        ];
    }

    public function prepareCreate(int $userId, array $data): int
    {
        $daysCount = $this->leaveRequestService->calcWorkDays(
            $data['start_date'],
            $data['end_date']
        );

        if ($daysCount <= 0) {
            throw ValidationException::withMessages([
                'dates' => 'La période doit contenir au moins un jour ouvrable.',
            ]);
        }

        if (!$this->balanceService->hasEnoughBalance(
            $userId,
            $data['leave_type_id'],
            $daysCount
        )) {
            throw ValidationException::withMessages([
                'balance' => 'Solde insuffisant pour ce type de congé.',
            ]);
        }

        if ($this->leaveRequestService->hasConflit(
            $userId,
            $data['start_date'],
            $data['end_date']
        )) {
            throw ValidationException::withMessages([
                'dates' => 'Cette période chevauche déjà une demande approuvée.',
            ]);
        }

        return $daysCount;
    }
}

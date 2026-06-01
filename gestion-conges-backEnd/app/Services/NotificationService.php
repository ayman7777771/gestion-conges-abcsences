<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Notification;

class NotificationService
{
    public function notifyManagerOnNewRequest(LeaveRequest $leaveRequest): ?Notification
    {
        $manager = $leaveRequest->user->manager;

        if (!$manager) {
            return null;
        }

        return Notification::create([
            'user_id' => $manager->id,
            'title' => 'Nouvelle demande de congé',
            'message' => "{$leaveRequest->user->name} a demandé un congé du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')}.",
            'type' => 'leave_request',
            'related_type' => 'leave_request',
            'related_id' => $leaveRequest->id,
            'is_read' => false,
        ]);
    }

    public function notifyEmployeeOnApproval(LeaveRequest $leaveRequest): Notification
    {
        return Notification::create([
            'user_id' => $leaveRequest->user_id,
            'title' => 'Demande approuvée',
            'message' => "Votre demande de congé du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')} a été approuvée.",
            'type' => 'approval',
            'related_type' => 'leave_request',
            'related_id' => $leaveRequest->id,
            'is_read' => false,
        ]);
    }

    public function notifyEmployeeOnRejection(LeaveRequest $leaveRequest): Notification
    {
        $comment = $leaveRequest->review_comment
            ? " Raison : {$leaveRequest->review_comment}"
            : '';

        return Notification::create([
            'user_id' => $leaveRequest->user_id,
            'title' => 'Demande refusée',
            'message' => "Votre demande de congé du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')} a été refusée.{$comment}",
            'type' => 'rejection',
            'related_type' => 'leave_request',
            'related_id' => $leaveRequest->id,
            'is_read' => false,
        ]);
    }

    public function notifyManagerOnCancellation(LeaveRequest $leaveRequest): ?Notification
    {
        $manager = $leaveRequest->user->manager;

        if (!$manager) {
            return null;
        }

        return Notification::create([
            'user_id' => $manager->id,
            'title' => 'Demande annulée',
            'message' => "{$leaveRequest->user->name} a annulé sa demande du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')}.",
            'type' => 'leave_request',
            'related_type' => 'leave_request',
            'related_id' => $leaveRequest->id,
            'is_read' => false,
        ]);
    }

    public function delete(int $notificationId): bool
    {
        return (bool) Notification::forCurrentUser()->find($notificationId)?->delete();
    }

    public function markAsRead(int $notificationId): ?Notification
    {
        $notification = Notification::forCurrentUser()->find($notificationId);

        return $notification?->markAsRead();
    }

    public function markAllAsRead(): void
    {
        Notification::forCurrentUser()
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function getUserNotifications($limit = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Notification::forCurrentUser()
            ->latest()
            ->paginate($limit);
    }

    public function getUnreadCount(): int
    {
        return Notification::forCurrentUser()
            ->unread()
            ->count();
    }
}

<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index()
    {
        $notifications = $this->notificationService->getUserNotifications(20);
        $unreadCount = $this->notificationService->getUnreadCount();

        return response()->json([
            'data' => $notifications->items(),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
            ]
        ]);
    }

    public function markAsRead($id)
    {
        $notification = $this->notificationService->markAsRead($id);

        if (!$notification) {
            return response()->json([
                'message' => 'Notification introuvable'
            ], 404);
        }

        return response()->json([
            'message' => 'Notification mise à jour avec succès',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead()
    {
        $this->notificationService->markAllAsRead();

        return response()->json([
            'message' => 'Toutes les notifications ont été mises à jour'
        ]);
    }

    public function delete($id)
    {
        $deleted = $this->notificationService->delete($id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Notification introuvable'
            ], 404);
        }

        return response()->json([
            'message' => 'Notification supprimée avec succès'
        ]);
    }

    public function unreadCount()
    {
        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount()
        ]);
    }
}
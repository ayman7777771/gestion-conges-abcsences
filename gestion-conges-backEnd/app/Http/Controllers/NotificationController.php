<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    /**
     * الحصول على إشعارات المستخدم الحالي
     * GET /api/notifications
     */
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

    /**
     * تحديد إشعار كمقروء
     * PATCH /api/notifications/{id}/read
     */
    public function markAsRead($id)
    {
        $notification = $this->notificationService->markAsRead($id);

        if (!$notification) {
            return response()->json([
                'message' => 'الإشعار غير موجود'
            ], 404);
        }

        return response()->json([
            'message' => 'تم تحديث الإشعار',
            'notification' => $notification
        ]);
    }

    /**
     * تحديد جميع الإشعارات كمقروءة
     * PATCH /api/notifications/mark-all-read
     */
    public function markAllAsRead()
    {
        $this->notificationService->markAllAsRead();

        return response()->json([
            'message' => 'تم تحديث جميع الإشعارات'
        ]);
    }

    /**
     * حذف إشعار
     * DELETE /api/notifications/{id}
     */
    public function delete($id)
    {
        $deleted = $this->notificationService->delete($id);

        if (!$deleted) {
            return response()->json([
                'message' => 'الإشعار غير موجود'
            ], 404);
        }

        return response()->json([
            'message' => 'تم حذف الإشعار بنجاح'
        ]);
    }

    /**
     * الحصول على عدد الإشعارات غير المقروءة فقط
     * GET /api/notifications/unread-count
     */
    public function unreadCount()
    {
        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount()
        ]);
    }
}
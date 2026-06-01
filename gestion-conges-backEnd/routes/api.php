<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DepartmentController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);
    
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);

    Route::get('/my/leave-requests', [LeaveRequestController::class, 'myRequests']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::patch('/leave-requests/{id}/cancel', [LeaveRequestController::class, 'cancel']);
    Route::get('/my/balances', [LeaveBalanceController::class, 'myBalances']);
    Route::middleware('role:manager')->group(function () {
        Route::get('/team/leave-requests', [LeaveRequestController::class, 'teamRequests']);
        Route::patch('/leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');;
        Route::patch('/leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
        Route::get('/team/calendar', [LeaveRequestController::class, 'calendar']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/leave-types', [LeaveTypeController::class, 'store']);
        Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
        Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);

        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::get('/users/{id}/balances', [LeaveBalanceController::class, 'userBalances']);
        Route::get('/departments', [DepartmentController::class, 'index']);

        Route::get('/admin/leave-requests', [LeaveRequestController::class, 'adminIndex']);
        Route::get('/admin/stats', [LeaveRequestController::class, 'stats']);
        Route::get('/admin/export', [LeaveRequestController::class, 'export']);
    });
});

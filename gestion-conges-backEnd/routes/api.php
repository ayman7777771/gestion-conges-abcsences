<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('guest');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/leave-types', [LeaveTypeController::class, 'index']);

    Route::get('/my/leave-requests', [LeaveRequestController::class, 'myRequests']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::patch('/leave-requests/{id}/cancel', [LeaveRequestController::class, 'cancel']);

    Route::get('/my/balances', [LeaveBalanceController::class, 'myBalances']);

    Route::middleware('can:canManageTeam')->group(function () {
        Route::get('/team/leave-requests', [LeaveRequestController::class, 'teamRequests']);
        Route::patch('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
        Route::patch('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
        Route::get('/team/calendar', [LeaveRequestController::class, 'calendar']);
    });

    Route::middleware('can:isAdmin')->group(function () {
        Route::post('/leave-types', [LeaveTypeController::class, 'store']);
        Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
        Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);

        Route::apiResource('users', UserController::class);
        Route::apiResource('departments', DepartmentController::class);

        Route::get('/users/{id}/balances', [LeaveBalanceController::class, 'userBalances']);

        Route::get('/admin/leave-requests', [LeaveRequestController::class, 'adminIndex']);
        Route::get('/admin/stats', [LeaveRequestController::class, 'stats']);
        Route::get('/admin/export', [LeaveRequestController::class, 'export']);
    });

});
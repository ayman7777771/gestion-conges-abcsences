<?php

namespace App\Http\Controllers;

use App\Actions\LeaveRequestAction;
use App\Exports\LeaveRequestsExport;
use App\Http\Requests\LeaveRequestRequest;
use App\Http\Requests\ReviewLeaveRequestRequest;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Services\LeaveBalanceService;
use App\Services\NotificationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class LeaveRequestController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private LeaveRequestAction $leaveRequestAction,
        private LeaveBalanceService $balanceService,
        private NotificationService $notificationService
    ) {
    }

    public function myRequests(Request $request)
    {
        return response()->json(
            LeaveRequest::forCurrentUser()
                ->withFilters($request)
                ->with(['leaveType', 'reviewer'])
                ->latest()
                ->paginate(20)
        );
    }

    public function store(LeaveRequestRequest $request)
    {
        $this->authorize('create', LeaveRequest::class);

        $validated = $request->validated();
        $daysCount = $this->leaveRequestAction->prepareCreate(auth()->id(), $validated);
        $isApprovedRole = in_array(auth()->user()->role, ['admin', 'manager']);

        $leaveRequest = LeaveRequest::create([
            'user_id' => auth()->id(),
            'leave_type_id' => $validated['leave_type_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'days_count' => $daysCount,
            'reason' => $validated['reason'] ?? null,
            'status' => $isApprovedRole ? 'approved' : 'pending',
        ]);

        if ($isApprovedRole) {
            $this->balanceService->deduct(auth()->id(), $validated['leave_type_id'], $daysCount);
        }

        $notification = $isApprovedRole
            ? null
            : $this->notificationService->notifyManagerOnNewRequest($leaveRequest->load('user.manager'));

        return response()->json([
            'message' => 'Demande de congé créée avec succès.',
            'leave_request' => $leaveRequest->load(['leaveType']),
            'notification' => $notification,
        ], 201);
    }

    public function cancel($id)
    {
        $leaveRequest = LeaveRequest::findOrFail($id);
        $this->authorize('cancel', $leaveRequest);

        $result = $this->leaveRequestAction->cancel($leaveRequest);

        return response()->json([
            'message' => 'Demande annulée avec succès.',
            'leave_request' => $result['request'],
            'notification' => $result['notification'] ?? null,
        ]);
    }

    public function calendar(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        return response()->json(
            LeaveRequest::forManagerTeam()
                ->approved()
                ->forMonth($month, $year)
                ->with(['user', 'leaveType'])
                ->get()
        );
    }

    public function teamRequests(Request $request)
    {
        return response()->json(
            LeaveRequest::forManagerTeam()
                ->withFilters($request)
                ->with(['user.department', 'leaveType', 'reviewer'])
                ->latest()
                ->paginate(20)
        );
    }

    public function approve(LeaveRequest $leaveRequest, ReviewLeaveRequestRequest $request)
    {
        $this->authorize('approve', $leaveRequest);

        $updated = $this->leaveRequestAction->approve(
            $leaveRequest,
            $request->validated()['review_comment'] ?? null
        );

        return response()->json([
            'message' => 'Demande approuvée avec succès.',
            'leave_request' => $updated,
        ]);
    }

    public function reject(LeaveRequest $leaveRequest, ReviewLeaveRequestRequest $request)
    {
        $this->authorize('reject', $leaveRequest);

        $updated = $this->leaveRequestAction->reject(
            $leaveRequest,
            $request->validated()['review_comment']
        );

        return response()->json([
            'message' => 'Demande refusée.',
            'leave_request' => $updated,
        ]);
    }

    public function adminIndex(Request $request)
    {
        return response()->json(
            LeaveRequest::query()
                ->withFilters($request)
                ->forDepartment($request->department)
                ->with(['user.department', 'leaveType', 'reviewer'])
                ->latest()
                ->paginate(20)
        );
    }

    public function stats(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $approvedRequests = LeaveRequest::approved()
            ->forMonth($month, $year)
            ->with(['user.department'])
            ->get();

        $totalAbsentDays = $approvedRequests->sum('days_count');
        $totalUsers = User::whereIn('role', ['employee', 'manager'])->count();
        $workDaysInMonth = $this->calculateWorkDays($month, $year);
        $totalPotentialWorkDays = $totalUsers * $workDaysInMonth;

        $absenceRate = $totalPotentialWorkDays > 0
            ? round(($totalAbsentDays / $totalPotentialWorkDays) * 100, 2)
            : 0;

        $topDepartments = $approvedRequests
            ->groupBy('user.department.name')
            ->map(fn ($group) => $group->sum('days_count'))
            ->sortDesc()
            ->take(10);

        return response()->json([
            'month' => (int) $month,
            'year' => (int) $year,
            'total_absences_count' => $approvedRequests->count(),
            'total_absent_days' => $totalAbsentDays,
            'top_departments' => $topDepartments,
            'absence_rate' => $absenceRate . '%',
        ]);
    }

    private function calculateWorkDays($month, $year)
    {
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $workDays = 0;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $month, $day, $year));

            if ($dayOfWeek < 6) {
                $workDays++;
            }
        }

        return $workDays;
    }

    public function export(Request $request)
    {
        return Excel::download(
            new LeaveRequestsExport($request->query('from'), $request->query('to')),
            'conges_export.csv',
            \Maatwebsite\Excel\Excel::CSV
        );
    }
}

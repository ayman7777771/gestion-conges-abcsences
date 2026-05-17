<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Http\Requests\LeaveRequestRequest;
use App\Http\Requests\ReviewLeaveRequestRequest;
use App\Services\LeaveRequestService;
use App\Services\LeaveBalanceService;
use App\Actions\LeaveRequestAction;
use App\Exports\LeaveRequestsExport;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class LeaveRequestController extends Controller
{
    public function __construct(
        private LeaveRequestService $leaveRequestService,
        private LeaveBalanceService $leaveBalanceService,
        private LeaveRequestAction $leaveRequestAction,
    ) {}

    public function myRequests(Request $request)
    {
        return response()->json(
            LeaveRequest::forCurrentUser()
                ->withFilters($request)
                ->with(['leaveType'])
                ->latest()
                ->paginate(20)
        );
    }

    public function store(LeaveRequestRequest $request)
    {
        $this->authorize('create', LeaveRequest::class);

        $validated = $request->validated();

        $daysCount = $this->leaveRequestService->calcWorkDays(
            $validated['start_date'],
            $validated['end_date']
        );

        if (!$this->leaveBalanceService->hasEnoughBalance(
            auth()->id(),
            $validated['leave_type_id'],
            $daysCount
        )) {
            return response()->json([
                'message' => 'Le solde est insuffisant pour ce type de congé'
            ], 422);
        }

        if ($this->leaveRequestService->hasConflit(
            auth()->id(),
            $validated['start_date'],
            $validated['end_date']
        )) {
            return response()->json([
                'message' => 'Vous avez déjà une demande existante pour ces dates'
            ], 422);
        }

        $leaveRequest = LeaveRequest::create([
            'user_id'       => auth()->id(),
            'leave_type_id' => $validated['leave_type_id'],
            'start_date'    => $validated['start_date'],
            'end_date'      => $validated['end_date'],
            'days_count'    => $daysCount,
            'reason'        => $validated['reason'] ?? null,
            'status'        => 'pending',
        ]);

        return response()->json(
            $leaveRequest->load(['leaveType']),
            201
        );
    }

    public function cancel(LeaveRequest $leaveRequest)
    {
        $this->authorize('cancel', $leaveRequest);

        $this->leaveRequestAction->cancel($leaveRequest);

        return response()->json([
            'message' => 'Demande annulée avec succès.'
        ]);
    }

    public function teamRequests(Request $request)
    {
        return response()->json(
            LeaveRequest::forManagerTeam()
                ->withFilters($request)
                ->with(['user', 'leaveType'])
                ->latest()
                ->paginate(20)
        );
    }

    public function approve(LeaveRequest $leaveRequest, ReviewLeaveRequestRequest $request)
    {
        $this->authorize('approve', $leaveRequest);

        $updated = $this->leaveRequestAction->approve(
            $leaveRequest,
            $request->review_comment
        );

        return response()->json([
            'message'       => 'Demande approuvée avec succès.',
            'leave_request' => $updated->load(['user', 'leaveType']),
        ]);
    }

    public function reject(LeaveRequest $leaveRequest, ReviewLeaveRequestRequest $request)
    {
        $this->authorize('reject', $leaveRequest);

        $updated = $this->leaveRequestAction->reject(
            $leaveRequest,
            $request->review_comment
        );

        return response()->json([
            'message'       => 'Demande refusée.',
            'leave_request' => $updated->load(['user', 'leaveType']),
        ]);
    }

    public function calendar(Request $request)
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        return response()->json(
            LeaveRequest::forManagerTeam()
                ->approved()
                ->forMonth($month, $year)
                ->with(['user', 'leaveType'])
                ->get()
        );
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
        $year  = $request->get('year', now()->year);

        $approvedRequests = LeaveRequest::approved()
            ->forMonth($month, $year)
            ->get();

        $totalAbsences = $approvedRequests->count();

        $topDepartments = $approvedRequests
            ->groupBy('user.department.name')
            ->map(fn($group) => $group->count())
            ->sortDesc()
            ->take(5);

        $totalUsers  = User::count();
        $absentUsers = $approvedRequests
            ->unique('user_id')
            ->count();

        $absenceRate = $totalUsers > 0
            ? round(($absentUsers / $totalUsers) * 100, 2)
            : 0;

        return response()->json([
            'month'           => $month,
            'year'            => $year,
            'total_absences'  => $totalAbsences,
            'top_departments' => $topDepartments,
            'absence_rate'    => $absenceRate . '%',
        ]);
    }

    public function export(Request $request)
    {
        return Excel::download(
            new LeaveRequestsExport($request->from, $request->to),
            'conges_export.csv',
            \Maatwebsite\Excel\Excel::CSV,
        );
    }
}
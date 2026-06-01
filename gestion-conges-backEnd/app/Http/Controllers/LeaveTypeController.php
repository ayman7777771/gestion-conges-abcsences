<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveTypeRequest;
use App\Models\LeaveType;
use App\Services\LeaveBalanceService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class LeaveTypeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private LeaveBalanceService $balanceService)
    {
    }

    public function index()
    {
        return response()->json(LeaveType::orderBy('name')->get());
    }

    public function store(LeaveTypeRequest $request)
    {
        $this->authorize('create', LeaveType::class);

        $leaveType = LeaveType::create($request->validated());
        $this->balanceService->createForLeaveType($leaveType);

        return response()->json([
            'message' => 'Type de congé créé avec succès.',
            'data' => $leaveType,
        ], 201);
    }

    public function update(LeaveTypeRequest $request, int $id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $this->authorize('update', $leaveType);

        $leaveType->update($request->validated());

        return response()->json([
            'message' => 'Type de congé mis à jour avec succès.',
            'data' => $leaveType,
        ]);
    }

    public function destroy(int $id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $this->authorize('delete', $leaveType);

        $leaveType->delete();

        return response()->json([
            'message' => 'Type de congé supprimé avec succès.',
        ]);
    }
}

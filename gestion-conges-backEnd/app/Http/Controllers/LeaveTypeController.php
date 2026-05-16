<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeaveType;
use App\Http\Requests\LeaveTypeRequest;

class LeaveTypeController extends Controller
{
    public function index()
    {
        $leaveTypes = LeaveType::all();

        return response()->json($leaveTypes);
    }

    public function store(LeaveTypeRequest $request)
    {
        $this->authorize('create', LeaveType::class);
        $leaveType = LeaveType::create($request->validated());
        return response()->json([
            'message' => 'Type de congé créé avec succès.',
            'data'    => $leaveType
        ], 201);
    }

    public function update(LeaveTypeRequest $request, int $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $this->authorize('update', $leaveType);

        $leaveType->update($request->validated());

        return response()->json([
            'message' => 'Type de congé mis à jour avec succès.',
            'data'    => $leaveType
        ]);
    }

    public function destroy(int $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $this->authorize('delete', $leaveType);

        $leaveType->delete();

        return response()->json([
            'message' => 'Type de congé supprimé avec succès.'
        ]);
    }
}
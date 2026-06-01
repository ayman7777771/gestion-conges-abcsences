<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use App\Http\Requests\DepartmentRequest;
class DepartmentController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Department::class);

        return response()->json(Department::orderBy('name')->get());
    }

    // public function show(Department $department)
    // {
    //     $this->authorize('view', $department);

    //     return response()->json($department);
    // }

    // public function store(DepartmentRequest $request)
    // {
    //     $this->authorize('create', Department::class);
    //     $department = Department::create($request->validated());
    //      return response()->json([
    //         'message' => 'Département créé avec succès.',
    //         'data'    => $department
    //     ], 201);
    // }

    // public function update(DepartmentRequest $request, Department $department)
    // {
    //     $this->authorize('update', $department);
    //     $department->update($request->validated());
    //     return response()->json([
    //         'message' => 'Département mis à jour avec succès.',
    //         'data'    => $department
    //     ]);
    // }

    // public function destroy(Department $department)
    // {
    //     $this->authorize('delete', $department);
    //     if ($department->users()->count() > 0) {
    //     return response()->json([
    //         'message' => 'Impossible de supprimer un département contenant des employés.'
    //     ], 422);
    // }
    //     $department->delete();
    //     return response()->json([
    //         'message' => 'Département supprimé avec succès.'
    //     ]);
    // }
}

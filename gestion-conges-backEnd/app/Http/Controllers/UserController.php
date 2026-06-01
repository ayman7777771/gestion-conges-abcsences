<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private LeaveBalanceService $balanceService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::with(['department', 'manager'])->latest();

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return response()->json($query->paginate(20));
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json($user->load(['department', 'manager', 'leaveBalances.leaveType']));
    }

    public function store(UserRequest $request)
    {
        $this->authorize('create', User::class);

        $user = User::create($request->validated());

        if (in_array($user->role, ['employee', 'manager'], true)) {
            $this->balanceService->createForUser($user);
        }

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'data' => $user->load(['department', 'manager', 'leaveBalances.leaveType']),
        ], 201);
    }

    public function update(UserRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $data = $request->validated();
        if (array_key_exists('password', $data) && blank($data['password'])) {
            unset($data['password']);
        }

        $wasWithoutBalances = $user->leaveBalances()->where('year', now()->year)->doesntExist();
        $user->update($data);

        if ($wasWithoutBalances && in_array($user->role, ['employee', 'manager'], true)) {
            $this->balanceService->createForUser($user);
        }

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'data' => $user->load(['department', 'manager', 'leaveBalances.leaveType']),
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $this->authorize('delete', $user);

        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.',
            ], 422);
        }

        if ($user->role === 'manager' && $user->employees()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un manager ayant des employés.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.',
        ]);
    }
}

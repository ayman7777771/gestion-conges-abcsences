<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\UserRequest;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', User::class);

        $users = User::with(['department', 'leaveBalances'])->paginate(20);

        return response()->json($users);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return response()->json(
            $user->load(['department', 'leaveBalances'])
        );
    }

    public function store(UserRequest $request)
    {
        $this->authorize('create', User::class);

        $user = User::create($request->validated());
        return response()->json([
                'message' => 'Utilisateur créé avec succès.',
                'data'    => $user->load('department')
            ],201);
        // hash of paswrod درتو ف model ديال User 
        // mot de passe of all users is 'password فحالة نسيت ماكتبتوش ف README'
    }

    public function update(UserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $user->update($request->validated());

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'data'    => $user->load('department')
        ]
        );
        // نفس الشيء هنا
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        if (auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte.'
            ], 422);
        }

        if ($user->role === 'manager' && $user->employees()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un manager ayant des employés.'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.'
        ]);
    }
}
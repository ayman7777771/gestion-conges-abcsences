<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        $rules = [
            'name' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email,' . $userId,
            'role' => 'required|in:employee,manager,admin',
            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:users,id|different:id',
        ];

        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'string', 'min:6'];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['password'] = ['nullable', 'string', 'min:6'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom est obligatoire.',
            'name.max' => 'Le nom ne doit pas dépasser 50 caractères.',
            'email.required' => "L'adresse email est obligatoire.",
            'email.email' => "L'adresse email est invalide.",
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
            'role.required' => 'Le rôle est obligatoire.',
            'role.in' => 'Le rôle sélectionné est invalide.',
            'department_id.required' => 'Le département est obligatoire.',
            'department_id.exists' => 'Le département sélectionné est invalide.',
            'manager_id.exists' => 'Le manager sélectionné est invalide.',
        ];
    }
}

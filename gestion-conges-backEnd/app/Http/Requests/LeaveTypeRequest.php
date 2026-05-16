<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LeaveTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $leaveTypeId = $this->route('id');

        return [
            'name' => 'required|string|max:255|unique:leave_types,name,' . $leaveTypeId,
            'default_quota' => 'required|integer|min:0',
            'is_paid' => 'required|boolean',
        ];
    }
        public function messages(): array
    {
        return [
            'name.required' => 'Le nom du type de congé est obligatoire.',
            'name.unique' => 'Ce type de congé existe déjà.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'default_quota.required' => 'Le quota annuel est obligatoire.',
            'default_quota.integer' => 'Le quota annuel doit être un nombre entier.',
            'default_quota.min'  => 'Le quota annuel ne peut pas être négatif.',
            'is_paid.required' => 'Veuillez préciser si le congé est payé ou non.',
            'is_paid.boolean' => 'La valeur du champ payé/non payé est invalide.',
        ];
    }

}

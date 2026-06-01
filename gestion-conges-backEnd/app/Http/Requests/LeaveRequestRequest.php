<?php
namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LeaveRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:500',
        ];
    }
     public function messages(): array
    {
        return [
            'leave_type_id.required' => 'Le type de congé est obligatoire.',
            'leave_type_id.exists' => 'Le type de congé sélectionné est invalide.',
            'start_date.required' => 'La date de début est obligatoire.',
            'start_date.date'  => 'La date de début est invalide.',
            'start_date.after_or_equal' => 'La date de début doit être aujourd\'hui ou ultérieure.',
            'end_date.required' => 'La date de fin est obligatoire.',
            'end_date.date' => 'La date de fin est invalide.',
            'end_date.after_or_equal' => 'La date de fin doit être égale ou postérieure à la date de début.',
            'reason.max' => 'Le motif ne doit pas dépasser 500 caractères.',
        ];
    }

}

<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DepartmentRequest extends FormRequest
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
        $departmentId = $this->route('id');
       return [
            'name' => 'required|string|max:255|unique:departments,name,' . $departmentId,
        ];
    }
     public function messages(): array
    {
        return [
            'name.required' => 'Le nom du département est obligatoire.',
            'name.unique'   => 'Ce département existe déjà.',
            'name.max'      => 'Le nom ne doit pas dépasser 255 caractères.',
        ];
    }
}

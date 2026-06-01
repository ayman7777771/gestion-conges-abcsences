<?php
namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ReviewLeaveRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return in_array(Auth::user()->role, ['manager', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->routeIs('*.reject')) {
            return [
                'review_comment' => 'required|string|min:5|max:500',
            ];
        }
        return [
            'review_comment' => 'nullable|string|max:500',
        ];
    }
     public function messages(): array
    {
        return [
            'review_comment.required' => 'Vous devez ajouter un commentaire en cas de refus.',
            'review_comment.min' => 'Le motif du refus doit contenir au moins 5 caractères.',
            'review_comment.max' => 'Le commentaire ne doit pas dépasser 500 caractères.',
        ];
    }
}

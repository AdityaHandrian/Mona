<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $userId = auth()->id();

        return [
            'category_id' => [
                'required', 'integer',
                Rule::exists('categories', 'id')->where(fn($q) => $q->where('user_id', $userId)),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'], 
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Kategori tidak ditemukan atau bukan milik Anda.',
        ];
    }
}

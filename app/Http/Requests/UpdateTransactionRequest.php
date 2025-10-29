<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:255'],
            'transaction_date' => [
                'sometimes',
                'date',
                'before_or_equal:now'  // Prevents future dates
            ],
            'transaction_details' => ['nullable', 'array'],
            'transaction_details.*.item_name' => [
                'required_with:transaction_details', 
                'string', 
                'max:255'
            ],
            'transaction_details.*.quantity' => [
                'required_with:transaction_details', 
                'integer', 
                'min:1'
            ],
            'transaction_details.*.item_price' => [
                'required_with:transaction_details', 
                'numeric', 
                'min:0'
            ],
        ];
    }

    public function messages()
    {
        return [
            'transaction_date.before_or_equal' => 'Transaction date cannot be in the future.',
            'transaction_date.date' => 'Transaction date must be a valid date.',
        ];
    }
}
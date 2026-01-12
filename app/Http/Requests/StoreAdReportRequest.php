<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'in:scam,spam,illegal,wrong_category,duplicate,offensive,other'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

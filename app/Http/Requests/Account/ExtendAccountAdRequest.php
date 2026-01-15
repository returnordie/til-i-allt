<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExtendAccountAdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $allowed = array_values(config('tia.ad_extend_allowed_days', [14, 30]));

        return [
            'days' => ['required', 'integer', Rule::in($allowed)],
        ];
    }
}

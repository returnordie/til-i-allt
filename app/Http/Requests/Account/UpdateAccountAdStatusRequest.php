<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountAdStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(['active', 'inactive', 'sold'])],
            'buyer_identifier' => ['nullable', 'string', 'max:255'],
            'sold_outside' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->input('status') !== 'sold') {
                return;
            }

            $buyerIdentifier = trim((string) $this->input('buyer_identifier', ''));
            $soldOutside = $this->boolean('sold_outside');

            if ($buyerIdentifier === '' && !$soldOutside) {
                $validator->errors()->add('buyer_identifier', 'Veldu kaupanda eða merktu sem selt utan vefsins.');
            }
        });
    }
}

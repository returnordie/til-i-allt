<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountNotificationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'email_on_message' => ['required', 'boolean'],
            'email_on_notifications' => ['required', 'boolean'],
            'email_on_system' => ['required', 'boolean'],
            'email_on_ad_expiring' => ['required', 'boolean'],
            'email_on_ad_expired' => ['required', 'boolean'],
        ];
    }
}

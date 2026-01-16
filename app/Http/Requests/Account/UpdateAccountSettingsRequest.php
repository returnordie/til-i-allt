<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;

class UpdateAccountSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();
        $userId = $user->id;

        $days = (int) config('tia.username_change_days', 30);
        $changedAt = $user->username_changed_at ? Carbon::parse($user->username_changed_at) : null;
        $nextAt = $changedAt ? $changedAt->copy()->addDays($days) : now();
        $canChange = now()->greaterThanOrEqualTo($nextAt);

        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],

            'date_of_birth' => ['nullable', 'date', 'before:today'],

            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:32',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('users', 'username')->ignore($userId),
                function (string $attribute, $value, \Closure $fail) use ($user, $canChange, $nextAt, $days) {
                    $value = $value === '' ? null : $value;

                    // If user isn't changing it, OK.
                    if ($value === $user->username) {
                        return;
                    }

                    // If attempting change but not allowed yet, block.
                    if (!$canChange) {
                        $fail("Þú getur breytt notendanafni á {$days} daga fresti. Næst mögulegt: ".$nextAt->format('Y-m-d H:i').'.');
                    }
                },
            ],

            'phone_e164' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^\+[1-9]\d{7,19}$/',
                Rule::unique('users', 'phone_e164')->ignore($userId),
            ],

            'postcode_id' => ['nullable', 'integer', 'exists:postcodes,id'],
            'address' => ['nullable', 'string', 'max:160'],
            'show_address' => ['required', 'boolean'],

            // defaults for new ads
            'show_name' => ['required', 'boolean'],
            'show_phone' => ['required', 'boolean'],

            // contact preferences
            'preferred_contact_method' => ['required', Rule::in(['message', 'call', 'any'])],
            'best_call_time' => ['nullable', 'string', 'max:64'],
            'contact_note' => ['nullable', 'string', 'max:140'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nafn vantar.',
            'date_of_birth.before' => 'Fæðingardagur þarf að vera í fortíð.',

            'username.regex' => 'Notandanafn má aðeins innihalda lágstafi, tölur og undirstrik (_).',
            'username.unique' => 'Þetta notandanafn er þegar í notkun.',

            'phone_e164.regex' => 'Símanúmer þarf að vera á E.164 sniði (t.d. +354... ).',
            'phone_e164.unique' => 'Þetta símanúmer er þegar í notkun.',

            'preferred_contact_method.in' => 'Veldu “skilaboð”, “símtal” eða “skiptir ekki máli”.',
        ];
    }
}

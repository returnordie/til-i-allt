<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateAccountSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountSettingsController extends Controller
{
    public function edit(): Response
    {
        $user = Auth::user();

        $days = (int) config('tia.username_change_days', 30);
        $changedAt = $user->username_changed_at ? Carbon::parse($user->username_changed_at) : null;

        $nextAt = $changedAt ? $changedAt->copy()->addDays($days) : now();
        $canChange = now()->greaterThanOrEqualTo($nextAt);

        return Inertia::render('Account/Settings/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'phone_e164' => $user->phone_e164,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'tia_balance' => (int) $user->tia_balance,

                // defaults for new ads
                'show_name' => (bool) $user->show_name,
                'show_phone' => (bool) $user->show_phone,

                // contact prefs
                'preferred_contact_method' => $user->preferred_contact_method ?? 'any',
                'best_call_time' => $user->best_call_time,
                'contact_note' => $user->contact_note,

                // username cooldown info
                'username_change_days' => $days,
                'can_change_username' => $canChange,
                'username_next_change_at' => $nextAt->toIso8601String(),
            ],
        ]);
    }

    public function update(UpdateAccountSettingsRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        // Normalize empties to null
        foreach (['username', 'phone_e164', 'best_call_time', 'contact_note', 'date_of_birth'] as $k) {
            if (array_key_exists($k, $validated) && $validated[$k] === '') {
                $validated[$k] = null;
            }
        }

        // Lowercase username
        if (array_key_exists('username', $validated) && $validated['username']) {
            $validated['username'] = mb_strtolower($validated['username']);
        }

        // Track username change time if changed
        if (array_key_exists('username', $validated) && $validated['username'] !== $user->username) {
            $validated['username_changed_at'] = now();
        } else {
            unset($validated['username']); // avoid touching unchanged username
        }

        $user->fill($validated)->save();

        return back()->with('success', 'Stillingar uppfærðar.');
    }
}

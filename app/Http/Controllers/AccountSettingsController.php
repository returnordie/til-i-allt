<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateAccountSettingsRequest;
use App\Models\Postcode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AccountSettingsController extends Controller
{
    public function edit(): Response
    {
        $user = Auth::user();
        $postcodes = Postcode::query()
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('Account/Settings/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'phone_e164' => $user->phone_e164,
                'postcode_id' => $user->postcode_id,
                'address' => $user->address,
                'show_address' => (bool) $user->show_address,

                // defaults (not for public profile; used as defaults in AdForm)
                'show_name' => (bool) $user->show_name,
                'show_phone' => (bool) $user->show_phone,

                // email prefs
                'email_on_message' => (bool) $user->email_on_message,
                'email_on_notifications' => (bool) $user->email_on_notifications,
                'email_on_system' => (bool) $user->email_on_system,
                'email_on_ad_expiring' => (bool) $user->email_on_ad_expiring,
                'email_on_ad_expired' => (bool) $user->email_on_ad_expired,
            ],
            'postcodes' => $postcodes,
        ]);
    }

    public function update(UpdateAccountSettingsRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        // normalize empties to null
        foreach (['username', 'phone_e164', 'address'] as $k) {
            if (array_key_exists($k, $validated) && $validated[$k] === '') {
                $validated[$k] = null;
            }
        }

        $user->fill($validated);
        $user->save();

        return back()->with('success', 'Stillingar uppfærðar.');
    }
}

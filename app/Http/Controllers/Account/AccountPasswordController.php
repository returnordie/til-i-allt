<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateAccountPasswordRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AccountPasswordController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Account/Security/Password');
    }

    public function update(UpdateAccountPasswordRequest $request): RedirectResponse
    {
        $user = Auth::user();

        $user->password = Hash::make($request->validated()['password']);
        $user->save();

        return back()->with('success', 'Lykilorði breytt.');
    }
}

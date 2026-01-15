<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'required',
                'string',
                'min:3',
                'max:32',
                'regex:/^[a-z0-9_]+$/',
                'lowercase',
                'unique:users,username',
            ],

            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'username.required' => 'Notandanafn vantar.',
            'username.min' => 'Notandanafn þarf að vera að minnsta kosti 3 stafir.',
            'username.max' => 'Notandanafn má mest vera 32 stafir.',
            'username.regex' => 'Notandanafn má aðeins innihalda lágstafi, tölur og undirstrik (_).',
            'username.unique' => 'Þetta notandanafn er þegar í notkun.',
        ]);

        $user = User::create([
            'name' => $request->string('name'),
            'username' => $request->string('username')->lower()->toString(),
            'username_changed_at' => now(), // svo cooldown virki strax
            'email' => $request->string('email'),
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

}

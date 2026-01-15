<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search', ''));

        $users = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'created_at' => $user->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'filters' => [
                'search' => $search,
            ],
            'users' => $users,
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'show_name' => (bool) $user->show_name,
                'show_phone' => (bool) $user->show_phone,
                'created_at' => $user->created_at?->toDateTimeString(),
            ],
            'roles' => ['user', 'admin'],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'username' => ['nullable', 'string', 'max:32', 'unique:users,username,' . $user->id],
            'role' => ['required', 'in:user,admin'],
            'is_active' => ['required', 'boolean'],
            'show_name' => ['required', 'boolean'],
            'show_phone' => ['required', 'boolean'],
        ]);

        $user->update($data);

        return redirect()
            ->route('admin.users.edit', $user)
            ->with('success', 'Notandi uppfærður.');
    }
}

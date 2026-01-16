<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateAccountNotificationsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class AccountNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString()
            ->through(function (DatabaseNotification $n) {
                $data = is_array($n->data) ? $n->data : [];

                return [
                    'id' => $n->id,
                    'read_at' => $n->read_at?->toDateTimeString(),
                    'created_at' => $n->created_at?->toDateTimeString(),
                    'data' => [
                        'kind' => $data['kind'] ?? 'system',
                        'title' => $data['title'] ?? 'Tilkynning',
                        'body' => $data['body'] ?? null,
                        'url' => $data['url'] ?? null,
                    ],
                    'links' => [
                        'open' => route('notifications.open', $n->id),
                    ],
                ];
            });

        return Inertia::render('Account/Notifications/Inbox', [
            'notifications' => $notifications,
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function open(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $user = $request->user();

        // Ensure ownership
        if ((string) $notification->notifiable_id !== (string) $user->id || $notification->notifiable_type !== get_class($user)) {
            abort(403);
        }

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        $url = is_array($notification->data) ? ($notification->data['url'] ?? null) : null;

        return $url ? redirect($url) : redirect()->route('notifications.inbox');
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }
    public function edit(): Response
    {
        $user = Auth::user();

        return Inertia::render('Account/Notifications/Edit', [
            'prefs' => [
                'email_on_message' => (bool) $user->email_on_message,
                'email_on_notifications' => (bool) $user->email_on_notifications,
                'email_on_system' => (bool) $user->email_on_system,
                'email_on_ad_expiring' => (bool) $user->email_on_ad_expiring,
                'email_on_ad_expired' => (bool) $user->email_on_ad_expired,
            ],
        ]);
    }

    public function update(UpdateAccountNotificationsRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $user->fill($request->validated())->save();

        return back()->with('success', 'Tilkynningar uppfærðar.');
    }
}

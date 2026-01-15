<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'auth' => [
                'user' => fn () => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'username' => $request->user()->username,
                        'show_name' => (bool) $request->user()->show_name,
                        'show_phone' => (bool) $request->user()->show_phone,
                    ]
                    : null,

                // 👇 NEW: unread conversations count (only for logged in users)
                'unreadConversationsCount' => fn () => $request->user()
                    ? (function () use ($request) {
                        $uid = $request->user()->id;

                        return Conversation::query()
                            ->whereNull('deleted_at')
                            ->where(function ($q) use ($uid) {
                                $q->where('owner_id', $uid)
                                    ->orWhere('member_id', $uid);
                            })
                            // don't count archived for this user
                            ->whereRaw("
                                CASE
                                    WHEN owner_id = ? THEN owner_archived_at
                                    ELSE member_archived_at
                                END IS NULL
                            ", [$uid])
                            ->whereNotNull('last_message_at')
                            // unread if last_message_at > last_read_at (null treated as old date)
                            ->whereRaw("
                                last_message_at > COALESCE(
                                    CASE
                                        WHEN owner_id = ? THEN owner_last_read_at
                                        ELSE member_last_read_at
                                    END,
                                    '1970-01-01 00:00:00'
                                )
                            ", [$uid])
                            ->count();
                    })()
                    : 0,
                'unreadNotificationsCount' => fn () => $request->user()
                    ? $request->user()->unreadNotifications()->count()
                    : 0,

                'recentNotifications' => fn () => $request->user()
                    ? $request->user()->notifications()
                        ->limit(10)
                        ->get()
                        ->map(fn ($n) => [
                            'id' => $n->id,
                            'read_at' => $n->read_at?->toDateTimeString(),
                            'created_at' => $n->created_at?->toDateTimeString(),
                            'title' => $n->data['title'] ?? 'Tilkynning',
                            'body' => $n->data['body'] ?? null,
                            'open_link' => route('notifications.open', $n->id),
                        ])
                        ->values()
                    : [],
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            // Nav tré (cache-að)
            'nav' => [
                'categories' => fn () => Cache::remember('nav:categories:v1', 3600, function () {
                    $sections = ['solutorg', 'bilatorg', 'fasteignir'];

                    return collect($sections)->mapWithKeys(function ($section) {
                        $parents = Category::query()
                            ->where('section', $section)
                            ->whereNull('parent_id')
                            ->where('is_active', true)
                            ->orderBy('sort_order')
                            ->with(['children' => function ($q) use ($section) {
                                $q->where('section', $section)
                                    ->where('is_active', true)
                                    ->orderBy('sort_order');
                            }])
                            ->get(['id', 'section', 'parent_id', 'name', 'slug', 'sort_order']);

                        return [$section => $parents->map(fn ($c) => [
                            'name' => $c->name,
                            'slug' => $c->slug,
                            'icon' => $c->icon,
                            'children' => $c->children->map(fn ($ch) => [
                                'name' => $ch->name,
                                'slug' => $ch->slug,
                                'icon' => $ch->icon,
                            ])->values(),
                        ])->values()];
                    });
                }),
            ],
        ];
    }
}

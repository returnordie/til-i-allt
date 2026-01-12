<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;
use App\Models\Category;

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
                        'ads_display_name' => $request->user()->ads_display_name,
                        'show_phone_in_ads' => (bool) $request->user()->show_phone_in_ads,
                    ]
                    : null,
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
                            'children' => $c->children->map(fn ($ch) => [
                                'name' => $ch->name,
                                'slug' => $ch->slug,
                            ])->values(),
                        ])->values()];
                    });
                })
            ]
        ];
    }
}

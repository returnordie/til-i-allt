<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ExtendAccountAdRequest;
use App\Http\Requests\Account\UpdateAccountAdStatusRequest;
use App\Models\Ad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountAdsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $status = (string) $request->string('status', 'all');
        $q = trim((string) $request->string('q', ''));

        $base = Ad::query()
            ->where('user_id', $user->id);

        $expiredScope = function ($query) {
            $query->where('status', 'expired')
                ->orWhere(function ($q) {
                    $q->whereIn('status', ['active', 'paused'])
                        ->whereNotNull('expires_at')
                        ->where('expires_at', '<', now());
                });
        };

        // Counts (active/paused exclude expired-by-date)
        $counts = [
            'all' => (clone $base)->count(),
            'draft' => (clone $base)->where('status', 'draft')->count(),
            'active' => (clone $base)->where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })->count(),
            'paused' => (clone $base)->where('status', 'paused')
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })->count(),
            'sold' => (clone $base)->where('status', 'sold')->count(),
            'archived' => (clone $base)->where('status', 'archived')->count(),
            'expired' => (clone $base)->where($expiredScope)->count(),
        ];

        $query = Ad::query()
            ->where('user_id', $user->id)
            ->with([
                'category:id,slug,name',
                'images' => function ($q) {
                    $q->orderByDesc('is_main')->orderBy('sort_order')->whereNull('deleted_at');
                },
            ]);

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($status !== 'all') {
            if ($status === 'expired') {
                $query->where($expiredScope);
            } elseif (in_array($status, ['active', 'paused'], true)) {
                $query->where('status', $status)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                    });
            } else {
                $query->where('status', $status);
            }
        }

        $query->orderByDesc('published_at')->orderByDesc('created_at');

        $ads = $query->paginate(20)->withQueryString()->through(function (Ad $ad) {
            $main = $ad->images->first();
            $mainUrl = $main ? route('ad-images.show', $main->public_id) : null;

            $isExpired = $ad->expires_at
                && $ad->expires_at->isPast()
                && in_array($ad->status, ['active', 'paused'], true);

            $displayStatus = $isExpired ? 'expired' : $ad->status;

            return [
                'id' => $ad->id,
                'title' => $ad->title,
                'price' => $ad->price,
                'currency' => $ad->currency,
                'section' => $ad->section,

                'status' => $displayStatus,
                'published_at' => $ad->published_at?->toDateTimeString(),
                'expires_at' => $ad->expires_at?->toDateTimeString(),
                'views_count' => (int) $ad->views_count,

                'category' => [
                    'slug' => $ad->category?->slug,
                    'name' => $ad->category?->name,
                ],

                'main_image_url' => $mainUrl,

                'links' => [
                    'edit' => route('ads.edit', $ad),
                    'show' => route('ads.show', [
                        'section' => $ad->section,
                        'categorySlug' => $ad->category?->slug,
                        'ad' => $ad->id,
                        'slug' => $ad->slug,
                    ]),
                    'extend' => route('account.ads.extend', $ad),
                    'status' => route('account.ads.status', $ad),
                ],
            ];
        });

        return Inertia::render('Account/Ads/Index', [
            'filters' => [
                'status' => $status,
                'q' => $q,
            ],
            'counts' => $counts,
            'extendOptions' => array_values(config('tia.ad_extend_allowed_days', [14, 30])),
            'ads' => $ads,
        ]);
    }

    public function setStatus(UpdateAccountAdStatusRequest $request, Ad $ad): RedirectResponse
    {
        $this->authorize('update', $ad);

        $status = $request->validated()['status'];

        // Basic guards
        if ($ad->status === 'archived' && $status === 'active') {
            // allow re-activate archived if you want; keep allowed here
        }

        if ($status === 'active') {
            if (!$ad->published_at) {
                $ad->published_at = now();
            }

            $duration = (int) config('tia.ad_default_duration_days', 30);

            if (!$ad->expires_at || $ad->expires_at->isPast()) {
                $ad->expires_at = now()->addDays($duration);
            }
        }

        $ad->status = $status;
        $ad->save();

        return back()->with('success', 'Staða uppfærð.');
    }

    public function extend(ExtendAccountAdRequest $request, Ad $ad): RedirectResponse
    {
        $this->authorize('update', $ad);

        if (in_array($ad->status, ['sold', 'archived'], true)) {
            return back()->with('error', 'Ekki hægt að framlengja seldar/geymdar auglýsingar.');
        }

        $days = (int) $request->validated()['days'];

        $base = ($ad->expires_at && $ad->expires_at->isFuture())
            ? $ad->expires_at->copy()
            : now();

        $newExpires = $base->addDays($days);

        $capDays = (int) config('tia.ad_extend_max_days_ahead', 180);
        $cap = now()->addDays($capDays);

        if ($newExpires->greaterThan($cap)) {
            $newExpires = $cap;
        }

        $ad->expires_at = $newExpires;

        // If it was expired, bring it back
        if ($ad->status === 'expired' || ($ad->status === 'paused' && $ad->expires_at->isFuture())) {
            // do nothing
        }

        if ($ad->status === 'expired') {
            $ad->status = 'active';
            $ad->published_at ??= now();
        }

        $ad->save();

        return back()->with('success', "Framlengt um {$days} daga.");
    }
}

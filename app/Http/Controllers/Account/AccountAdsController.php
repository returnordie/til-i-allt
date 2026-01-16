<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ExtendAccountAdRequest;
use App\Http\Requests\Account\UpdateAccountAdStatusRequest;
use App\Models\Ad;
use App\Models\Deal;
use App\Models\User;
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

        $inactiveScope = function ($query) use ($expiredScope) {
            $query->whereIn('status', ['draft', 'paused', 'archived'])
                ->orWhere($expiredScope);
        };

        // Counts (active/paused exclude expired-by-date)
        $counts = [
            'all' => (clone $base)->count(),
            'active' => (clone $base)->where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })->count(),
            'sold' => (clone $base)->where('status', 'sold')->count(),
            'inactive' => (clone $base)->where($inactiveScope)->count(),
        ];

        $query = Ad::query()
            ->where('user_id', $user->id)
            ->with([
                'category:id,slug,name',
                'images' => function ($q) {
                    $q->orderByDesc('is_main')->orderBy('sort_order')->whereNull('deleted_at');
                },
                'latestDeal.buyer:id,name',
            ]);

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($status !== 'all') {
            if ($status === 'inactive') {
                $query->where($inactiveScope);
            } elseif ($status === 'active') {
                $query->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                    });
            } elseif ($status === 'sold') {
                $query->where('status', 'sold');
            }
        }

        $query->orderByDesc('published_at')->orderByDesc('created_at');

        $ads = $query->paginate(20)->withQueryString()->through(function (Ad $ad) {
            $main = $ad->images->first();
            $mainUrl = $main ? route('ad-images.show', $main->public_id) : null;

            $isExpired = $ad->expires_at
                && $ad->expires_at->isPast()
                && in_array($ad->status, ['active', 'paused'], true);

            $displayStatus = 'active';

            if ($ad->status === 'sold') {
                $displayStatus = 'sold';
            } elseif ($isExpired || in_array($ad->status, ['draft', 'paused', 'archived'], true)) {
                $displayStatus = 'inactive';
            }

            $latestDeal = $ad->latestDeal;
            $buyer = $latestDeal?->buyer;
            $soldOutside = $latestDeal && !$latestDeal->buyer_id;

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

                'buyer' => $buyer ? [
                    'id' => $buyer->id,
                    'name' => $buyer->name,
                ] : null,
                'sold_outside' => $soldOutside,

                'main_image_url' => $mainUrl,
                'can_extend' => !in_array($ad->status, ['sold', 'archived', 'draft'], true),

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

        $data = $request->validated();
        $status = $data['status'];

        if ($ad->status === 'sold' && $status !== 'sold') {
            return back()->with('error', 'Seld auglýsing er ekki hægt að endurvekja eða breyta.');
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

        if ($status === 'inactive') {
            $ad->status = 'paused';
        } else {
            $ad->status = $status;
        }

        if ($status === 'sold') {
            $buyerId = null;
            $buyerIdentifier = isset($data['buyer_identifier']) ? trim((string) $data['buyer_identifier']) : '';
            $soldOutside = (bool) ($data['sold_outside'] ?? false);

            if (!$soldOutside && $buyerIdentifier !== '') {
                $buyer = ctype_digit($buyerIdentifier)
                    ? User::query()->where('id', (int) $buyerIdentifier)->first()
                    : User::query()->where('username', $buyerIdentifier)->first();

                if (!$buyer) {
                    return back()->withErrors(['buyer_identifier' => 'Kaupandi fannst ekki.']);
                }

                if ((int) $buyer->id === (int) $ad->user_id) {
                    return back()->withErrors(['buyer_identifier' => 'Þú getur ekki skráð sjálfan þig sem kaupanda.']);
                }

                $buyerId = $buyer->id;
            }

            $deal = Deal::query()
                ->where('ad_id', $ad->id)
                ->where('seller_id', $ad->user_id)
                ->latest('id')
                ->first();

            if (!$deal) {
                $deal = new Deal([
                    'ad_id' => $ad->id,
                    'seller_id' => $ad->user_id,
                    'buyer_id' => null,
                    'status' => 'completed',
                    'price_final' => $ad->price,
                    'currency' => $ad->currency ?? 'ISK',
                ]);
            }

            $deal->status = 'completed';
            $deal->completed_at = $deal->completed_at ?? now();
            $deal->buyer_id = $soldOutside ? null : $buyerId;
            $deal->meta = array_merge($deal->meta ?? [], [
                'sold_outside' => $soldOutside || !$deal->buyer_id,
            ]);
            $deal->save();
        }

        $ad->save();

        $title = $ad->title ?: 'ónefnd auglýsing';
        $message = match ($status) {
            'active' => "Auglýsingin „{$title}“ hefur verið gerð virk.",
            'inactive' => "Auglýsingin „{$title}“ hefur verið gerð óvirk.",
            'sold' => "Auglýsingin „{$title}“ hefur verið merkt frágengin.",
            default => "Staða auglýsingarinnar „{$title}“ hefur verið uppfærð.",
        };

        return back()->with('success', $message);
    }

    public function extend(ExtendAccountAdRequest $request, Ad $ad): RedirectResponse
    {
        $this->authorize('update', $ad);

        if (in_array($ad->status, ['sold', 'archived'], true)) {
            return back()->with('error', 'Ekki hægt að framlengja seldar/geymdar auglýsingar.');
        }

        $title = $ad->title ?: 'ónefnd auglýsing';
        $days = (int) $request->validated()['days'];

        $base = ($ad->expires_at && $ad->expires_at->isFuture())
            ? $ad->expires_at->copy()
            : now();

        $capDays = (int) config('tia.ad_extend_max_days_ahead', 180);
        $cap = now()->addDays($capDays);

        $newExpires = $base->copy()->addDays($days);

        if ($newExpires->greaterThan($cap)) {
            return back()->with(
                'error',
                "Ekki er hægt að framlengja birtingatíma auglýsingarinnar „{$title}“ lengur en {$capDays} daga. Hægt er að framlengja aftur seinna.",
            );
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

        return back()->with('success', "Birtingatími á auglýsingu „{$title}“ hefur verið framlengdur um {$days} daga.");
    }
}

<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountDealsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $deals = Deal::query()
            ->where(function ($query) use ($user) {
                $query
                    ->where('buyer_id', $user->id)
                    ->orWhere('seller_id', $user->id);
            })
            ->with([
                'ad:id,title,section,slug,category_id',
                'ad.category:id,slug',
                'seller:id,name',
                'buyer:id,name',
            ])
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $deals = $deals->through(function (Deal $deal) use ($user) {
            $isSeller = (int) $deal->seller_id === (int) $user->id;
            $canCancel = $isSeller
                && $deal->status === 'active'
                && (bool) $deal->buyer_id;

            return [
                'id' => $deal->id,
                'status' => $deal->status,
                'confirmed_at' => $deal->confirmed_at?->toDateTimeString(),
                'completed_at' => $deal->completed_at?->toDateTimeString(),
                'canceled_at' => $deal->canceled_at?->toDateTimeString(),
                'price_final' => $deal->price_final,
                'currency' => $deal->currency ?? 'ISK',
                'seller' => $deal->seller ? [
                    'id' => $deal->seller->id,
                    'name' => $deal->seller->name,
                ] : null,
                'buyer' => $deal->buyer ? [
                    'id' => $deal->buyer->id,
                    'name' => $deal->buyer->name,
                ] : null,
                'is_seller' => $isSeller,
                'ad' => $deal->ad ? [
                    'title' => $deal->ad->title,
                    'link' => route('ads.show', [
                        'section' => $deal->ad->section,
                        'categorySlug' => $deal->ad->category?->slug,
                        'ad' => $deal->ad->id,
                        'slug' => $deal->ad->slug,
                    ]),
                ] : null,
                'can_respond' => !$isSeller && $deal->status === 'active' && (bool) $deal->confirmed_at,
                'can_cancel' => $canCancel,
                'links' => [
                    'set_status' => route('deals.setStatus', $deal),
                ],
            ];
        });

        return Inertia::render('Account/Deals/Index', [
            'deals' => $deals,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}

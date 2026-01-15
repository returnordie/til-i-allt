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
            ->where('buyer_id', $user->id)
            ->with([
                'ad:id,title,section,slug,category_id',
                'ad.category:id,slug',
                'seller:id,name',
            ])
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $deals = $deals->through(function (Deal $deal) {
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
                'ad' => $deal->ad ? [
                    'title' => $deal->ad->title,
                    'link' => route('ads.show', [
                        'section' => $deal->ad->section,
                        'categorySlug' => $deal->ad->category?->slug,
                        'ad' => $deal->ad->id,
                        'slug' => $deal->ad->slug,
                    ]),
                ] : null,
                'can_respond' => $deal->status === 'active' && (bool) $deal->confirmed_at,
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

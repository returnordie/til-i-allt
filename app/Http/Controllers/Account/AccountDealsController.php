<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use App\Models\DealReview;
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
                'ad.images:id,ad_id,public_id,sort_order',
                'seller:id,name',
                'buyer:id,name',
            ])
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $dealIds = $deals->getCollection()->pluck('id');

        $reviewedDealIds = DealReview::query()
            ->where('rater_id', $user->id)
            ->whereIn('deal_id', $dealIds)
            ->pluck('deal_id')
            ->all();

        $reviewedLookup = array_flip($reviewedDealIds);
        $receivedReviews = DealReview::query()
            ->whereIn('deal_id', $dealIds)
            ->where('ratee_id', $user->id)
            ->get()
            ->keyBy('deal_id');

        $deals = $deals->through(function (Deal $deal) use ($user, $reviewedLookup, $receivedReviews) {
            $isSeller = (int) $deal->seller_id === (int) $user->id;
            $canCancel = $isSeller
                && $deal->status === 'active'
                && (bool) $deal->buyer_id;
            $hasReview = isset($reviewedLookup[$deal->id]);
            $reviewOpen = $deal->reviewsAreOpen();
            $receivedReview = $receivedReviews->get($deal->id);
            $mainImage = $deal->ad?->images?->first();
            $mainImageUrl = $mainImage ? route('ad-images.show', $mainImage->public_id) : null;

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
                    'main_image_url' => $mainImageUrl,
                    'link' => route('ads.show', [
                        'section' => $deal->ad->section,
                        'categorySlug' => $deal->ad->category?->slug,
                        'ad' => $deal->ad->id,
                        'slug' => $deal->ad->slug,
                    ]),
                ] : null,
                'can_respond' => !$isSeller && $deal->status === 'active' && (bool) $deal->confirmed_at,
                'can_cancel' => $canCancel,
                'review' => [
                    'can_review' => $deal->status === 'completed'
                        && (bool) $deal->buyer_id
                        && $reviewOpen
                        && !$hasReview,
                    'has_review' => $hasReview,
                    'is_open' => $reviewOpen,
                    'received_rating' => $receivedReview ? (float) $receivedReview->rating : null,
                    'link' => route('account.deals.review', $deal),
                ],
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

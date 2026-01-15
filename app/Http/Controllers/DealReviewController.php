<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\DealReview;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealReviewController extends Controller
{
    public function create(Request $request, Deal $deal)
    {
        $user = $request->user();

        abort_unless($deal->isParticipant($user->id), 403);

        $deal->load([
            'ad:id,title,section,slug,category_id',
            'ad.category:id,slug',
            'seller:id,name',
            'buyer:id,name',
        ]);

        $isSeller = (int) $deal->seller_id === (int) $user->id;
        $ratee = $isSeller ? $deal->buyer : $deal->seller;

        $reviews = DealReview::query()
            ->where('deal_id', $deal->id)
            ->latest('id')
            ->get();

        $existingReview = $reviews->firstWhere('rater_id', $user->id);
        $otherReview = $reviews->firstWhere('rater_id', '!=', $user->id);

        $canReview = Gate::allows('createReview', $deal) && !$existingReview;

        $reviewWindowEndsAt = $deal->completed_at
            ? $deal->completed_at->copy()->addDays(14)
            : null;

        return Inertia::render('Account/Deals/Review', [
            'deal' => [
                'id' => $deal->id,
                'status' => $deal->status,
                'completed_at' => $deal->completed_at?->toDateTimeString(),
                'review_opens_at' => $deal->reviewsOpenAt()?->toDateTimeString(),
                'review_closes_at' => $reviewWindowEndsAt?->toDateTimeString(),
                'ad' => $deal->ad ? [
                    'title' => $deal->ad->title,
                    'link' => route('ads.show', [
                        'section' => $deal->ad->section,
                        'categorySlug' => $deal->ad->category?->slug,
                        'ad' => $deal->ad->id,
                        'slug' => $deal->ad->slug,
                    ]),
                ] : null,
            ],
            'ratee' => $ratee ? [
                'id' => $ratee->id,
                'name' => $ratee->name,
                'profile_url' => $ratee->username ? route('users.show', $ratee->username) : null,
            ] : null,
            'existingReview' => $existingReview ? [
                'rating' => $existingReview->rating,
                'comment' => $existingReview->comment,
                'created_at' => $existingReview->created_at?->toDateTimeString(),
            ] : null,
            'otherReview' => $existingReview && $otherReview ? [
                'rating' => $otherReview->rating,
                'comment' => $otherReview->comment,
                'created_at' => $otherReview->created_at?->toDateTimeString(),
                'rater_name' => $otherReview->rater_id === $deal->seller_id ? $deal->seller?->name : $deal->buyer?->name,
            ] : null,
            'canReview' => $canReview,
            'storeUrl' => route('dealReviews.store', $deal),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }

    public function store(Request $request, Deal $deal)
    {
        $user = $request->user();

        abort_if($deal->status !== 'completed', 422, 'Aðeins er hægt að gefa umsögn þegar viðskiptum er lokið.');
        abort_if(!$deal->buyer_id, 422, 'Kaupandi vantar á viðskiptin.');
        abort_if(!$deal->reviewsAreOpen(), 422, 'Umsagnaglugginn er ekki opinn enn eða er lokaður.');

        $isSeller = (int) $deal->seller_id === (int) $user->id;
        $isBuyer  = (int) $deal->buyer_id === (int) $user->id;

        abort_unless($isSeller || $isBuyer, 403);

        $rateeId = $isSeller ? (int) $deal->buyer_id : (int) $deal->seller_id;

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:0', 'max:5'],
            'comment' => ['nullable', 'string', 'max:5000'],
            'meta' => ['nullable', 'array'],
        ]);

        // ratee_id er sett server-side (ekki treysta client)
        DealReview::create([
            'deal_id' => $deal->id,
            'rater_id' => $user->id,
            'ratee_id' => $rateeId,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'meta' => $data['meta'] ?? null,
        ]);

        return back()->with('success', 'Umsögn vistuð.');
    }
}

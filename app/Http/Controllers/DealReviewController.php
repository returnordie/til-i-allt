<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\DealReview;
use Illuminate\Http\Request;

class DealReviewController extends Controller
{
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
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
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

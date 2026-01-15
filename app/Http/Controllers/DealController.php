<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Deal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function store(Request $request, Ad $ad)
    {
        $user = $request->user();

        // aðeins seljandi (eigandi ad) má stofna deal
        abort_unless((int) $ad->user_id === (int) $user->id, 403);

        $data = $request->validate([
            'buyer_id' => ['nullable', 'integer', 'exists:users,id', 'different:'.$user->id],
            'price_final' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        // þú getur valið: annaðhvort alltaf create, eða “reuse” current proposed/confirmed
        $deal = Deal::query()
            ->where('ad_id', $ad->id)
            ->where('seller_id', $user->id)
            ->whereIn('status', ['proposed', 'confirmed'])
            ->latest('id')
            ->first();

        if (!$deal) {
            $deal = new Deal([
                'ad_id' => $ad->id,
                'seller_id' => $user->id,
                'status' => 'proposed',
                'currency' => $data['currency'] ?? 'ISK',
            ]);
        }

        $deal->buyer_id = $data['buyer_id'] ?? $deal->buyer_id;
        $deal->price_final = $data['price_final'] ?? $deal->price_final;
        $deal->currency = $data['currency'] ?? $deal->currency;
        $deal->save();

        return back()->with('success', 'Viðskipti stofnuð.');
    }

    public function setBuyer(Request $request, Deal $deal)
    {
        $user = $request->user();

        // aðeins seljandi má “merkja kaupanda”
        abort_unless((int) $deal->seller_id === (int) $user->id, 403);

        abort_if($deal->status === 'completed', 422, 'Viðskiptum er lokið.');

        $data = $request->validate([
            'buyer_id' => ['nullable', 'integer', 'exists:users,id', 'different:'.$user->id],
        ]);

        $deal->buyer_id = $data['buyer_id'];
        $deal->save();

        return back()->with('success', 'Kaupandi uppfærður.');
    }

    public function setStatus(Request $request, Deal $deal)
    {
        $user = $request->user();

        $data = $request->validate([
            'status' => ['required', 'in:proposed,confirmed,completed,canceled,disputed'],
        ]);

        $to = $data['status'];

        // aðgangsstýring (einföld og practical)
        // - seljandi: má alltaf cancel/dispute/complete
        // - kaupandi: má confirm (og optionally dispute)
        $isSeller = (int) $deal->seller_id === (int) $user->id;
        $isBuyer  = $deal->buyer_id && (int) $deal->buyer_id === (int) $user->id;

        abort_unless($isSeller || $isBuyer, 403);

        if ($to === 'confirmed') {
            abort_unless($isBuyer || $isSeller, 403);
            abort_if(!$deal->buyer_id, 422, 'Það þarf að vera valinn kaupandi.');
            $deal->status = 'confirmed';
            $deal->confirmed_at = $deal->confirmed_at ?? now();
        }

        if ($to === 'completed') {
            abort_unless($isSeller, 403); // þú getur leyft buyer líka ef þú vilt
            abort_if(!$deal->buyer_id, 422, 'Það þarf að vera valinn kaupandi.');
            $deal->status = 'completed';
            $deal->completed_at = $deal->completed_at ?? now();
        }

        if ($to === 'canceled') {
            abort_unless($isSeller, 403);
            $deal->status = 'canceled';
            $deal->canceled_at = $deal->canceled_at ?? now();
        }

        if ($to === 'disputed') {
            // leyfa báðum
            $deal->status = 'disputed';
        }

        if ($to === 'proposed') {
            abort_unless($isSeller, 403);
            $deal->status = 'proposed';
        }

        $deal->save();

        return back()->with('success', 'Staða viðskipta uppfærð.');
    }
}

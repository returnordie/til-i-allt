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

        // þú getur valið: annaðhvort alltaf create, eða “reuse” current active
        $deal = Deal::query()
            ->where('ad_id', $ad->id)
            ->where('seller_id', $user->id)
            ->whereIn('status', ['active'])
            ->latest('id')
            ->first();

        if (!$deal) {
            $deal = new Deal([
                'ad_id' => $ad->id,
                'seller_id' => $user->id,
                'status' => 'active',
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
            'status' => ['required', 'in:active,inactive,completed'],
        ]);

        $to = $data['status'];

        // aðgangsstýring (einföld og practical)
        // - seljandi: má stjórna stöðu
        // - kaupandi: má hætta við innan 24 klst eftir frágang
        $isSeller = (int) $deal->seller_id === (int) $user->id;
        $isBuyer  = $deal->buyer_id && (int) $deal->buyer_id === (int) $user->id;

        abort_unless($isSeller || $isBuyer, 403);

        if ($deal->status === 'completed') {
            if ($to !== 'inactive') {
                abort(422, 'Viðskiptum er lokið.');
            }

            abort_unless($isBuyer, 403);

            $windowEndsAt = $deal->completed_at?->copy()->addHours(24);
            abort_if(!$windowEndsAt || now()->greaterThan($windowEndsAt), 422, 'Það er ekki hægt að hætta við eftir 24 klst.');

            $deal->status = 'inactive';
            $deal->canceled_at = $deal->canceled_at ?? now();
        } else {
            if ($to === 'completed') {
                abort_unless($isSeller, 403);
                abort_if(!$deal->buyer_id, 422, 'Það þarf að vera valinn kaupandi.');
                $deal->status = 'completed';
                $deal->completed_at = $deal->completed_at ?? now();
            }

            if ($to === 'inactive') {
                abort_unless($isSeller, 403);
                $deal->status = 'inactive';
                $deal->canceled_at = $deal->canceled_at ?? now();
            }

            if ($to === 'active') {
                abort_unless($isSeller, 403);
                $deal->status = 'active';
            }
        }

        $deal->save();

        return back()->with('success', 'Staða viðskipta uppfærð.');
    }
}

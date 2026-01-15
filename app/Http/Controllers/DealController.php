<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Deal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    private function syncAdStatus(Deal $deal): void
    {
        $deal->loadMissing('ad');
        $ad = $deal->ad;

        if (!$ad || $ad->status === 'sold') {
            return;
        }

        $ad->status = $deal->buyer_id ? 'inactive' : 'active';
        $ad->save();
    }

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

        $buyerProvided = array_key_exists('buyer_id', $data);
        $newBuyerId = $buyerProvided ? $data['buyer_id'] : $deal->buyer_id;
        $buyerChanged = $buyerProvided && $deal->buyer_id !== $newBuyerId;

        $deal->buyer_id = $newBuyerId;
        $deal->price_final = $data['price_final'] ?? $deal->price_final;
        $deal->currency = $data['currency'] ?? $deal->currency;

        if ($buyerChanged) {
            $deal->confirmed_at = $newBuyerId ? now() : null;
        }
        $deal->save();
        $this->syncAdStatus($deal);

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

        $buyerChanged = $deal->buyer_id !== $data['buyer_id'];

        $deal->buyer_id = $data['buyer_id'];

        if ($buyerChanged) {
            $deal->confirmed_at = $data['buyer_id'] ? now() : null;
        }
        $deal->save();
        $this->syncAdStatus($deal);

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
        // - kaupandi: má samþykkja/hafna þegar hann er merktur
        $isSeller = (int) $deal->seller_id === (int) $user->id;
        $isBuyer  = $deal->buyer_id && (int) $deal->buyer_id === (int) $user->id;

        abort_unless($isSeller || $isBuyer, 403);

        if ($to === 'completed') {
            abort_unless($isBuyer, 403);
            abort_if(!$deal->buyer_id, 422, 'Það þarf að vera valinn kaupandi.');
            abort_if(!$deal->confirmed_at, 422, 'Seljandi þarf fyrst að merkja kaupanda.');
            abort_if($deal->status !== 'active', 422, 'Viðskipti eru ekki virk.');

            $deal->status = 'completed';
            $deal->completed_at = $deal->completed_at ?? now();
        }

        if ($to === 'inactive') {
            abort_unless($isSeller || $isBuyer, 403);
            abort_if($deal->status === 'completed', 422, 'Viðskiptum er lokið.');

            $deal->status = 'inactive';
            $deal->canceled_at = $deal->canceled_at ?? now();
            $deal->buyer_id = null;
            $deal->confirmed_at = null;
        }

        if ($to === 'active') {
            abort_unless($isSeller, 403);
            $deal->status = 'active';
        }

        $deal->save();
        $this->syncAdStatus($deal);

        return back()->with('success', 'Staða viðskipta uppfærð.');
    }
}

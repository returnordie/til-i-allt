<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\DealReview;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        // Ef þú vilt fela bannaða/óvirka notendur á public:
        if ($user->banned_at || !$user->is_active) {
            abort(404);
        }

        $adsQuery = Ad::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>=', now());
            })
            ->with([
                'category:id,slug,name',
                'images' => function ($q) {
                    $q->whereNull('deleted_at')
                        ->orderByDesc('is_main')
                        ->orderBy('sort_order');
                },
            ])
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        $ads = $adsQuery->paginate(24)->withQueryString()->through(function (Ad $ad) {
            $main = $ad->images->first();

            $imageUrl = null;
            if ($main) {
                // Public: signað URL (því AdImageController@show krefst signed fyrir public)
                $imageUrl = URL::temporarySignedRoute(
                    'ad-images.show',
                    now()->addMinutes(30),
                    ['adImage' => $main->public_id]
                );
            }

            return [
                'id' => $ad->id,
                'title' => $ad->title,
                'slug' => $ad->slug,
                'price' => $ad->price,
                'currency' => $ad->currency,
                'location_text' => $ad->location_text,
                'section' => $ad->section,
                'published_at' => $ad->published_at?->toDateTimeString(),

                'category' => [
                    'slug' => $ad->category?->slug,
                    'name' => $ad->category?->name,
                ],

                'main_image_url' => $imageUrl,

                'links' => [
                    'show' => route('ads.show', [
                        'section' => $ad->section,
                        'categorySlug' => $ad->category?->slug,
                        'ad' => $ad->id,
                        'slug' => $ad->slug,
                    ]),
                ],
            ];
        });

        $ratingSummary = DealReview::query()
            ->where('ratee_id', $user->id)
            ->whereNull('deleted_at')
            ->selectRaw('AVG(rating) as avg, COUNT(*) as count')
            ->first();

        $ratingAvg = $ratingSummary?->avg ? (float) $ratingSummary->avg : 0.0;
        $ratingCount = (int) ($ratingSummary?->count ?? 0);

        return Inertia::render('Users/Show', [
            'profile' => [
                'username' => $user->username,
                'display_name' => $user->show_name ? $user->name : ($user->username ?? $user->name),
                'member_since' => $user->created_at?->toDateString(),
                'active_ads_count' => (clone $adsQuery)->count(),

                'rating' => [
                    'avg' => $ratingAvg,
                    'count' => $ratingCount,
                ],
            ],
            'ads' => $ads,
        ]);
    }
}

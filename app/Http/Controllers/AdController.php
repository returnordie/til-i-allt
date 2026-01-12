<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdController extends Controller
{
    public function index(string $section, string $categorySlug)
    {
        $category = Category::query()
            ->where('section', $section)
            ->where('slug', $categorySlug)
            ->where('is_active', true)
            ->firstOrFail();

        $childIds = Category::query()
            ->where('section', $section)
            ->where('parent_id', $category->id)
            ->where('is_active', true)
            ->pluck('id');

        $categoryIds = $childIds->isNotEmpty()
            ? $childIds
            : collect([$category->id]);

        $query = Ad::query()
            ->select(['id','user_id','category_id','section','slug','title','price','status','created_at'])
            ->where('section', $section)
            ->whereIn('category_id', $categoryIds)
            ->where('status', 'active') // ef þú ert með status; annars sleppa
            ->latest();

        $ads = $query
            ->with([
                'category:id,section,parent_id,name,slug',
                'images' => fn ($q) => $q
                    ->select(['id','ad_id','public_id','is_main','sort_order'])
                    ->orderByDesc('is_main')
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->paginate(24)
            ->withQueryString()
            ->through(fn ($ad) => [
                'id' => $ad->id,
                'title' => $ad->title,
                'price' => $ad->price,
                'slug' => $ad->slug,
                'section' => $ad->section,
                'category' => [
                    'name' => $ad->category?->name,
                    'slug' => $ad->category?->slug,
                ],
                'main_image_url' => $ad->images->first()
                    ? route('ad-images.show', $ad->images->first())
                    : null,
                'show_url' => route('ads.show', [
                    'section' => $ad->section,
                    'categorySlug' => $ad->category?->slug,
                    'ad' => $ad->id,
                    'slug' => $ad->slug,
                ]),
            ]);

        return Inertia::render('Ads/Index', [
            'section' => $section,
            'category' => $category,
            'ads' => $ads,
        ]);
    }


    public function show(string $section, string $categorySlug, Ad $ad, ?string $slug = null)
    {
        $ad->load([
            'category:id,section,parent_id,name,slug',
            'images:id,ad_id,public_id,is_main,sort_order',
            'user:id,name,username,ads_display_name,show_phone_in_ads,phone_e164',
        ]);

        $user = $request->user();
        $isOwnerOrAdmin = $user && ($user->id === $ad->user_id || $user->isAdmin());

        if (($ad->status ?? 'active') !== 'active' && ! $isOwnerOrAdmin) {
            abort(404);
        }

        $expectedSection = $ad->section;
        $expectedCategorySlug = $ad->category?->slug;
        $expectedSlug = $ad->slug;

        if ($section !== $expectedSection || $categorySlug !== $expectedCategorySlug || $slug !== $expectedSlug) {
            return redirect()->route('ads.show', [
                'section' => $expectedSection,
                'categorySlug' => $expectedCategorySlug,
                'ad' => $ad->id,
                'slug' => $expectedSlug,
            ], 301);
        }

        return Inertia::render('Ads/Show', [
            'ad' => [
                'id' => $ad->id,
                'title' => $ad->title,
                'price' => $ad->price,
                'description' => $ad->description,
                'section' => $ad->section,
                'slug' => $ad->slug,
                'category' => [
                    'name' => $ad->category?->name,
                    'slug' => $ad->category?->slug,
                ],
                'images' => $ad->images
                    ->sortByDesc('is_main')
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn ($img) => [
                        'id' => $img->id,
                        'url' => route('ad-images.show', $img),
                        'is_main' => (bool) $img->is_main,
                    ]),
                'seller' => [
                    'id' => $ad->user->id,
                    'display' => $ad->user->ads_display_name === 'name'
                        ? $ad->user->name
                        : ($ad->user->username ?? $ad->user->name),
                    'phone' => $ad->user->show_phone_in_ads ? $ad->user->phone_e164 : null,
                ],
            ],
        ]);
    }



}

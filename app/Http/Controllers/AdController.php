<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\Deal;
use App\Models\AdPromotion;
use App\Models\Category;
use App\Models\AdAttributeValue;
use App\Models\AdViewUnique;
use App\Models\DealReview;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\URL;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Http\Requests\UpdateAdRequest;
use App\Http\Requests\StoreAdRequest;
use Illuminate\Support\Facades\DB;

class AdController extends Controller
{
    private function applyActiveAdsScope($query)
    {
        return $query
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            });
    }

    private function applyPromotionOrdering($query)
    {
        $promoSub = AdPromotion::query()
            ->selectRaw("
            ad_id,
            MIN(
                CASE type
                    WHEN 'featured' THEN 1
                    WHEN 'spotlight' THEN 2
                    WHEN 'bump' THEN 3
                    ELSE 9
                END
            ) as type_rank,
            MIN(priority) as promo_priority,
            MAX(starts_at) as promo_starts_at
        ")
            ->whereNull('deleted_at')
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->groupBy('ad_id');

        $query->leftJoinSub($promoSub, 'ap', function ($join) {
            $join->on('ap.ad_id', '=', 'ads.id');
        });

        // Promoted first (ap.ad_id NOT NULL), then type_rank/priority,
        // then daily deterministic rotation inside promoted,
        // then published_at newest.
        $query->orderByRaw("CASE WHEN ap.ad_id IS NULL THEN 1 ELSE 0 END ASC")
            ->orderBy('ap.type_rank')
            ->orderBy('ap.promo_priority')
            ->orderByRaw("CASE WHEN ap.ad_id IS NULL THEN NULL ELSE CRC32(CONCAT(ads.id, DATE(NOW()))) END ASC")
            ->orderByDesc('ads.published_at')
            ->orderByDesc('ads.created_at');

        return $query;
    }

    private function baseIndexQuery()
    {
        return Ad::query()->from('ads');
    }

    private function userRatingSummary(int $userId): array
    {
        $summary = DealReview::query()
            ->where('ratee_id', $userId)
            ->whereNull('deleted_at')
            ->selectRaw('AVG(rating) as avg, COUNT(*) as count')
            ->first();

        return [
            'avg' => $summary?->avg ? (float) $summary->avg : 0.0,
            'count' => (int) ($summary?->count ?? 0),
        ];
    }

    private function recordUniqueView(Ad $ad, Request $request, bool $isOwnerOrAdmin): void
    {
        if ($isOwnerOrAdmin) {
            return;
        }

        $user = $request->user();
        $viewerKey = $user
            ? 'user:' . $user->id
            : 'session:' . $request->session()->getId();

        $salt = config('app.key');
        $viewerHash = hash('sha256', $viewerKey . '|' . $salt);
        $viewedOn = now()->toDateString();

        $exists = AdViewUnique::query()
            ->where('ad_id', $ad->id)
            ->where('viewer_hash', $viewerHash)
            ->where('viewed_on', $viewedOn)
            ->exists();

        if ($exists) {
            return;
        }

        $ip = $request->ip();
        $ua = $request->userAgent();

        AdViewUnique::create([
            'ad_id' => $ad->id,
            'user_id' => $user?->id,
            'viewer_hash' => $viewerHash,
            'viewed_on' => $viewedOn,
            'ip_hash' => $ip ? hash('sha256', $ip . '|' . $salt) : null,
            'ua_hash' => $ua ? hash('sha256', $ua . '|' . $salt) : null,
        ]);

        $ad->increment('views_count');
    }

    private function mapAdCard($ad)
    {
        $img = $ad->images->first();

        $imgUrl = $img
            ? URL::temporarySignedRoute('ad-images.show', now()->addMinutes(30), ['adImage' => $img->public_id])
            : null;

        return [
            'id' => $ad->id,
            'title' => $ad->title,
            'price' => $ad->price,
            'slug' => $ad->slug,
            'section' => $ad->section,
            'category' => [
                'name' => $ad->category?->name,
                'slug' => $ad->category?->slug,
            ],
            'main_image_url' => $imgUrl,
            'show_url' => route('ads.show', [
                'section' => $ad->section,
                'categorySlug' => $ad->category?->slug,
                'ad' => $ad->id,
                'slug' => $ad->slug,
            ]),
        ];
    }

    public function home()
    {
        $query = $this->baseIndexQuery()
            ->select([
                'ads.id','ads.user_id','ads.category_id','ads.section','ads.slug',
                'ads.title','ads.price','ads.status','ads.published_at','ads.created_at'
            ]);

        $this->applyActiveAdsScope($query);
        $this->applyPromotionOrdering($query);

        $ads = $query
            ->with([
                'category:id,section,parent_id,name,slug',
                'images' => fn ($q) => $q
                    ->select(['id','ad_id','public_id','is_main','sort_order'])
                    ->whereNull('deleted_at')
                    ->orderByDesc('is_main')
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->paginate(24)
            ->withQueryString()
            ->through(fn ($ad) => $this->mapAdCard($ad));

        return Inertia::render('Ads/Index', [
            'section' => null,
            'category' => null,
            'ads' => $ads,
            'mode' => 'home',
        ]);
    }

    public function section(string $section)
    {
        $categoryIds = Category::query()
            ->where('section', $section)
            ->where('is_active', true)
            ->pluck('id');

        $query = $this->baseIndexQuery()
            ->select([
                'ads.id','ads.user_id','ads.category_id','ads.section','ads.slug',
                'ads.title','ads.price','ads.status','ads.published_at','ads.created_at'
            ])
            ->where('ads.section', $section)
            ->whereIn('ads.category_id', $categoryIds);

        $this->applyActiveAdsScope($query);
        $this->applyPromotionOrdering($query);

        $ads = $query
            ->with([
                'category:id,section,parent_id,name,slug,hero_art', // ✅
                'images' => fn ($q) => $q
                    ->select(['id','ad_id','public_id','is_main','sort_order'])
                    ->whereNull('deleted_at')
                    ->orderByDesc('is_main')
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->paginate(24)
            ->withQueryString()
            ->through(fn ($ad) => $this->mapAdCard($ad));

        return Inertia::render('Ads/Index', [
            'section' => $section,
            'category' => null,
            'ads' => $ads,
            'mode' => 'section',
        ]);
    }


    public function index(string $section, string $categorySlug)
    {
        $category = Category::query()
            ->select(['id','section','parent_id','name','slug','hero_art','icon', 'sort_order']) // ✅
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

        $query = $this->baseIndexQuery()
            ->select([
                'ads.id','ads.user_id','ads.category_id','ads.section','ads.slug',
                'ads.title','ads.price','ads.status','ads.published_at','ads.created_at'
            ])
            ->where('ads.section', $section)
            ->whereIn('ads.category_id', $categoryIds);

        $this->applyActiveAdsScope($query);
        $this->applyPromotionOrdering($query);

        $ads = $query
            ->with([
                'category:id,section,parent_id,name,slug,hero_art', // ✅
                'images' => fn ($q) => $q
                    ->select(['id','ad_id','public_id','is_main','sort_order'])
                    ->whereNull('deleted_at')
                    ->orderByDesc('is_main')
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->paginate(24)
            ->withQueryString()
            ->through(fn ($ad) => $this->mapAdCard($ad));

        return Inertia::render('Ads/Index', [
            'section' => $section,
            'category' => $category, // ✅ nú alltaf með hero_art
            'ads' => $ads,
            'mode' => 'category',
        ]);
    }


    public function show(Request $request, string $section, string $categorySlug, Ad $ad, ?string $slug = null)
    {
        $ad->load([
            'category:id,section,parent_id,name,slug,hero_art',
            'images:id,ad_id,public_id,is_main,sort_order',
            'user:id,name,username,show_name,show_phone,phone_e164,postcode_id,address,show_address',
            'user.postcode:id,code,name,region_id',
            'user.postcode.region:id,name',
            'attributeValues.definition:id,key,label,type,unit,group,options',
        ]);

        $user = $request->user();
        $isOwnerOrAdmin = $user && ($user->id === $ad->user_id || (method_exists($user, 'isAdmin') && $user->isAdmin()));
        $buyerHasAccess = false;

        if ($user && ($ad->status ?? 'active') !== 'active') {
            $buyerHasAccess = Deal::query()
                ->where('ad_id', $ad->id)
                ->where('buyer_id', $user->id)
                ->whereNotNull('confirmed_at')
                ->where('confirmed_at', '>=', now()->subDays(30))
                ->exists();
        }

        if (($ad->status ?? 'active') !== 'active' && ! $isOwnerOrAdmin && ! $buyerHasAccess) {
            abort(404);
        }

        $this->recordUniqueView($ad, $request, $isOwnerOrAdmin);

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

        $attributes = $ad->attributeValues
            ->map(function ($v) {
                $def = $v->definition;
                if (! $def) return null;

                $value = $v->value_json ?? $v->value_number ?? $v->value_bool ?? $v->value_text;

                return [
                    'key' => $def->key,
                    'label' => $def->label,
                    'type' => $def->type,
                    'group' => $def->group,
                    'unit' => $def->unit,
                    'options' => $def->options,
                    'value' => $value,
                ];
            })
            ->filter()
            ->values();

        $images = $ad->images
            ->sortBy(fn ($img) => [ $img->is_main ? 0 : 1, (int) $img->sort_order ])
            ->values()
            ->map(function ($img) use ($isOwnerOrAdmin, $ad) {
                $url = $isOwnerOrAdmin
                    ? route('ad-images.show', ['adImage' => $img->public_id])
                    : URL::temporarySignedRoute('ad-images.show', now()->addMinutes(30), ['adImage' => $img->public_id]);

                return [
                    'id' => $img->id,
                    'public_id' => $img->public_id,
                    'url' => $url,
                    'is_main' => (bool) $img->is_main,
                ];
            });

        $rating = $this->userRatingSummary($ad->user_id);

        return Inertia::render('Ads/Show', [
            'ad' => [
                'id' => $ad->id,
                'title' => $ad->title,
                'price' => $ad->price,
                'description' => $ad->description,
                'section' => $ad->section,
                'slug' => $ad->slug,
                'listing_type' => $ad->listing_type ?? null,
                'views_count' => (int) $ad->views_count,

                'category' => [
                    'name' => $ad->category?->name,
                    'slug' => $ad->category?->slug,
                ],

                'images' => $images,

                'seller' => [
                    'id' => $ad->user->id,
                    'display' => $ad->user->show_name
                        ? $ad->user->name
                        : ($ad->user->username ?? $ad->user->name),
                    'phone' => $ad->user->show_phone ? $ad->user->phone_e164 : null,
                    'address' => $ad->user->show_address ? $ad->user->address : null,
                    'postcode' => $ad->user->postcode ? [
                        'id' => $ad->user->postcode->id,
                        'code' => $ad->user->postcode->code,
                        'name' => $ad->user->postcode->name,
                        'region' => $ad->user->postcode->region ? [
                            'id' => $ad->user->postcode->region->id,
                            'name' => $ad->user->postcode->region->name,
                        ] : null,
                    ] : null,
                    'rating' => $rating,
                    'links' => [
                        'profile' => route('users.show', $ad->user),
                    ],
                ],

                'attributes' => $attributes,
            ],
        ]);
    }
    public function create(Request $request)
    {
        $section = $request->string('section')->toString();
        $parentSlug = $request->string('category_slug')->toString();
        $childSlug = $request->string('subcategory_slug')->toString();

        $fieldDefs = [];

        if ($section && $parentSlug) {
            $category = $this->resolveCategory($section, $parentSlug, $childSlug ?: null);
            $fieldDefs = $this->fieldDefsForCategory($category);
        }

        return Inertia::render('Ads/Create', [
            'fieldDefs' => $fieldDefs,
        ]);
    }

    public function store(StoreAdRequest $request)
    {
        $base = $request->validated();

        $category = $this->resolveCategory(
            $base['section'],
            $base['category_slug'],
            $base['subcategory_slug'] ?? null
        );

        $validatedDynamic = $this->validateDynamicAttributes($request, $category);

        $listingType = match ($base['listing_type']) {
            'sell', 'for_sale' => 'for_sale',
            'want', 'wanted' => 'wanted',
            default => $base['listing_type'],
        };

        return DB::transaction(function () use ($request, $base, $category, $listingType) {
            $ad = Ad::create([
                'user_id' => $request->user()->id,
                'section' => $base['section'],
                'category_id' => $category->id,
                'listing_type' => $listingType,
                'title' => $base['title'],
                'slug' => Str::slug($base['title']),
                'price' => $base['price'] ?? null,
                'description' => $base['description'] ?? null,
                'location_text' => $base['location_text'] ?? null,
                'postcode_id' => $base['postcode_id'] ?? null,
                'status' => 'active',
            ]);

            $this->syncAttributeValues($ad, $category, $request->input('attributes', []));

            $files = $request->file('images', []);
            $mainIndex = isset($base['main_image_index']) ? (int)$base['main_image_index'] : null;

            if (!empty($files)) {
                $this->storeAdImages($ad, $files, $mainIndex);
            }

            return redirect()->route('ads.show', [
                'section' => $ad->section,
                'categorySlug' => $category->slug,
                'ad' => $ad->id,
                'slug' => $ad->slug,
            ]);
        });
    }
    public function edit(Request $request, Ad $ad)
    {
        // $this->authorize('update', $ad);
        abort_if($ad->status === 'sold', 403, 'Seld auglýsing er ekki hægt að breyta.');

        $ad->load([
            'category:id,parent_id,name,slug',
            'category.parent:id,name,slug',
            'images:id,ad_id,public_id,is_main,sort_order',
            'attributeValues.definition:id,key,type',
        ]);

        $categorySlug = $ad->category?->parent ? $ad->category->parent->slug : ($ad->category?->slug ?? '');
        $subcategorySlug = $ad->category?->parent ? ($ad->category?->slug ?? '') : '';

        $images = $ad->images
            ->sortBy(fn ($img) => [ $img->is_main ? 0 : 1, (int) $img->sort_order ])
            ->values()
            ->map(fn ($img) => [
                'id' => $img->id,
                'public_id' => $img->public_id,
                'is_main' => (bool) $img->is_main,
                'url' => route('ad-images.show', ['adImage' => $img->public_id]),
            ]);

        // attributes -> key => value (sama og þú notar í form)
        $attrs = $ad->attributeValues->mapWithKeys(function ($v) {
            $key = $v->definition?->key;
            if (!$key) return [];
            $value = $v->value_json ?? $v->value_number ?? $v->value_bool ?? $v->value_text;
            return [$key => $value];
        });

        return Inertia::render('Ads/Edit', [
            'ad' => [
                'id' => $ad->id,
                'section' => $ad->section,
                'category_slug' => $categorySlug,
                'subcategory_slug' => $subcategorySlug,
                'listing_type' => $ad->listing_type, // sell/want í formi hjá þér (eða normalizaðu)
                'title' => $ad->title,
                'price' => $ad->price,
                'description' => $ad->description,
                'attributes' => $attrs,
                'images' => $images,
            ],
            'fieldDefs' => $this->fieldDefsForCategory($ad->category), // ef þú ert með, annars []
        ]);
    }

    public function update(UpdateAdRequest $request, Ad $ad)
    {
        // $this->authorize('update', $ad);
        abort_if($ad->status === 'sold', 403, 'Seld auglýsing er ekki hægt að breyta.');

        $base = $request->validated();

        $category = $this->resolveCategory(
            $base['section'],
            $base['category_slug'],
            $base['subcategory_slug'] ?? null
        );

        $listingType = match ($base['listing_type']) {
            'sell', 'for_sale' => 'for_sale',
            'want', 'wanted' => 'wanted',
            default => $base['listing_type'],
        };

        return DB::transaction(function () use ($request, $ad, $base, $category, $listingType) {

            $ad->update([
                'section' => $base['section'],
                'category_id' => $category->id,
                'listing_type' => $listingType,
                'title' => $base['title'],
                'slug' => Str::slug($base['title']),
                'price' => $base['price'] ?? null,
                'description' => $base['description'] ?? null,
                'location_text' => $base['location_text'] ?? null,
                'postcode_id' => $base['postcode_id'] ?? null,
            ]);

            $this->syncAttributeValues($ad, $category, $request->input('attributes', []));

            // 1) Soft-delete valdar myndir (ekki eyða file)
            $deletePublicIds = $request->input('delete_image_public_ids', []);
            if (!empty($deletePublicIds)) {
                $imgs = $ad->images()->whereIn('public_id', $deletePublicIds)->get();
                foreach ($imgs as $img) {
                    $img->delete();
                }
            }

            // 2) Upload nýjar (trimma í 15)
            $files = $request->file('images', []);
            $files = is_array($files) ? array_values(array_filter($files)) : [];

            $remainingCount = $ad->images()->count(); // non-trashed ef images() er án withTrashed
            $slots = max(0, 15 - $remainingCount);

            if ($slots <= 0) {
                $files = [];
            } elseif (count($files) > $slots) {
                $files = array_slice($files, 0, $slots);
            }

            $createdPublicIds = [];
            if (!empty($files)) {
                $createdPublicIds = $this->storeAdImages($ad, $files);
            }

            // 3) Aðalmynd
            $mainPublicId = $request->input('main_image_public_id');
            $mainIndex = $request->input('main_image_index');

            if ($mainPublicId && $ad->images()->where('public_id', $mainPublicId)->exists()) {
                $ad->images()->update(['is_main' => false]);
                $ad->images()->where('public_id', $mainPublicId)->update(['is_main' => true]);
            } elseif ($mainIndex !== null && is_numeric($mainIndex)) {
                $mainIndex = (int) $mainIndex;
                if (isset($createdPublicIds[$mainIndex])) {
                    $ad->images()->update(['is_main' => false]);
                    $ad->images()->where('public_id', $createdPublicIds[$mainIndex])->update(['is_main' => true]);
                }
            }

            $this->ensureMainImage($ad);

            $categorySlug = $category->parent ? $category->parent->slug : $category->slug;

            return redirect()
                ->route('ads.show', [
                    'section' => $ad->section,
                    'categorySlug' => $categorySlug,
                    'ad' => $ad->id,
                    'slug' => $ad->slug,
                ])
                ->with('success', 'Auglýsing uppfærð.');
        });
    }

    /**
     * Vista myndir á private disk og skila public_id í réttri röð.
     * (Passar við schema: public_id ULID + disk/path/sort_order/is_main)
     */
    private function storeAdImages(Ad $ad, array $files): array
    {
        $startOrder = (int) ($ad->images()->max('sort_order') ?? 0);
        $createdPublicIds = [];

        foreach (array_values($files) as $i => $file) {
            $filename = (string) Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs((string) $ad->id, $filename, 'ads');

            $img = $ad->images()->create([
                'disk' => 'ads',
                'path' => $path,
                'sort_order' => $startOrder + $i + 1,
                'is_main' => false,
            ]);

            $createdPublicIds[] = $img->public_id;
        }

        return $createdPublicIds;
    }

    private function ensureMainImage(Ad $ad): void
    {
        if (!$ad->images()->exists()) return;
        if ($ad->images()->where('is_main', true)->exists()) return;

        $first = $ad->images()->orderBy('sort_order')->first();
        if (!$first) return;

        $ad->images()->update(['is_main' => false]);
        $ad->images()->whereKey($first->id)->update(['is_main' => true]);
    }


// ---------- Helpers ----------

    private function resolveCategory(string $section, string $parentSlug, ?string $childSlug): Category
    {
        if ($childSlug) {
            $child = Category::query()
                ->where('section', $section)
                ->where('slug', $childSlug)
                ->where('is_active', true)
                ->firstOrFail();

            if ($child->parent_id) {
                $parent = Category::query()->where('id', $child->parent_id)->first();
                if (! $parent || $parent->slug !== $parentSlug) {
                    abort(422, 'Ógilt flokkaval.');
                }
            }

            return $child;
        }

        return Category::query()
            ->where('section', $section)
            ->where('slug', $parentSlug)
            ->where('is_active', true)
            ->firstOrFail();
    }

    private function fieldDefsForCategory(Category $category): array
    {
        return $category->attributes()
            ->get(['attribute_definitions.id','key','label','type','options','unit','placeholder','help','group'])
            ->map(fn ($def) => [
                'key' => $def->key,
                'label' => $def->label,
                'type' => $def->type,
                'required' => (bool) $def->pivot->required,
                'options' => $def->options,
                'unit' => $def->unit,
                'placeholder' => $def->placeholder,
                'help' => $def->help,
                'group' => $def->group,
            ])
            ->values()
            ->all();
    }

    private function validateDynamicAttributes(Request $request, Category $category): array
    {
        $defs = $category->attributes()->get();

        $rules = [];
        foreach ($defs as $def) {
            $base = $def->pivot->required ? ['required'] : ['nullable'];

            $rules["attributes.{$def->key}"] = match ($def->type) {
                'number' => array_merge($base, ['numeric']),
                'boolean' => array_merge($base, ['boolean']),
                'textarea' => array_merge($base, ['string','max:20000']),
                'select' => array_merge($base, ['string', Rule::in(collect($def->options ?? [])->pluck('value')->all())]),
                'multiselect' => array_merge($base, ['array']),
                default => array_merge($base, ['string','max:255']),
            };
        }

        // multiselect options validate (per item)
        foreach ($defs->where('type','multiselect') as $def) {
            $allowed = collect($def->options ?? [])->pluck('value')->all();
            $rules["attributes.{$def->key}.*"] = ['string', Rule::in($allowed)];
        }

        return Validator::make($request->all(), $rules)->validate();
    }

    private function syncAttributeValues(Ad $ad, Category $category, array $attributes): void
    {
        $defs = $category->attributes()->get();
        $map = collect($attributes);

        foreach ($defs as $def) {
            $val = $map->get($def->key);

            // empty -> delete
            $isEmpty =
                $val === null ||
                $val === '' ||
                (is_array($val) && count($val) === 0);

            if ($isEmpty) {
                $ad->attributeValues()->where('attribute_definition_id', $def->id)->delete();
                continue;
            }

            $payload = [
                'value_text' => null,
                'value_number' => null,
                'value_bool' => null,
                'value_json' => null,
            ];

            if ($def->type === 'number') $payload['value_number'] = $val;
            elseif ($def->type === 'boolean') $payload['value_bool'] = (bool) $val;
            elseif ($def->type === 'multiselect') $payload['value_json'] = array_values((array) $val);
            else $payload['value_text'] = (string) $val;

            $ad->attributeValues()->updateOrCreate(
                ['attribute_definition_id' => $def->id],
                $payload
            );
        }
    }

    private function attributesArrayForEdit(Ad $ad): array
    {
        $out = [];
        foreach ($ad->attributeValues as $v) {
            $key = $v->definition?->key;
            if (! $key) continue;

            if ($v->value_json !== null) $out[$key] = $v->value_json;
            elseif ($v->value_number !== null) $out[$key] = $v->value_number;
            elseif ($v->value_bool !== null) $out[$key] = $v->value_bool;
            else $out[$key] = $v->value_text;
        }
        return $out;
    }



}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search', ''));
        $status = trim((string) $request->string('status', ''));

        $ads = Ad::query()
            ->with(['user:id,name', 'category:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Ad $ad) => [
                'id' => $ad->id,
                'title' => $ad->title,
                'status' => $ad->status,
                'price' => $ad->price,
                'currency' => $ad->currency,
                'created_at' => $ad->created_at?->toDateTimeString(),
                'user' => $ad->user ? [
                    'id' => $ad->user->id,
                    'name' => $ad->user->name,
                ] : null,
                'category' => $ad->category ? [
                    'id' => $ad->category->id,
                    'name' => $ad->category->name,
                ] : null,
            ]);

        return Inertia::render('Admin/Ads/Index', [
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusOptions' => ['draft', 'active', 'paused', 'archived', 'sold', 'expired'],
            'ads' => $ads,
        ]);
    }

    public function edit(Ad $ad): Response
    {
        return Inertia::render('Admin/Ads/Edit', [
            'ad' => [
                'id' => $ad->id,
                'title' => $ad->title,
                'status' => $ad->status,
                'price' => $ad->price,
                'currency' => $ad->currency,
                'category_id' => $ad->category_id,
                'expires_at' => $ad->expires_at?->toDateString(),
                'negotiable' => (bool) $ad->negotiable,
            ],
            'categories' => Category::query()->orderBy('section')->orderBy('name')->get(['id', 'name', 'section']),
            'statusOptions' => ['draft', 'active', 'paused', 'archived', 'sold', 'expired'],
        ]);
    }

    public function update(Request $request, Ad $ad): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:draft,active,paused,archived,sold,expired'],
            'price' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'expires_at' => ['nullable', 'date'],
            'negotiable' => ['required', 'boolean'],
        ]);

        $ad->fill($data);

        if ($data['status'] === 'active') {
            $ad->published_at ??= now();

            if (!$ad->expires_at || $ad->expires_at->isPast()) {
                $days = (int) config('tia.ad_default_duration_days', 30);
                $ad->expires_at = now()->addDays($days);
            }
        }

        $ad->save();

        return redirect()
            ->route('admin.ads.edit', $ad)
            ->with('success', 'Auglýsing uppfærð.');
    }
}

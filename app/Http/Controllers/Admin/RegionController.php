<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegionController extends Controller
{
    public function index(): Response
    {
        $regions = Region::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Region $region) => [
                'id' => $region->id,
                'name' => $region->name,
                'slug' => $region->slug,
                'sort_order' => $region->sort_order,
                'is_active' => (bool) $region->is_active,
            ]);

        return Inertia::render('Admin/Regions/Index', [
            'regions' => $regions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Regions/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateRegion($request);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $region = Region::query()->create($data);

        return redirect()
            ->route('admin.regions.edit', $region)
            ->with('success', 'Svæði stofnað.');
    }

    public function edit(Region $region): Response
    {
        return Inertia::render('Admin/Regions/Edit', [
            'region' => [
                'id' => $region->id,
                'name' => $region->name,
                'slug' => $region->slug,
                'sort_order' => $region->sort_order,
                'is_active' => (bool) $region->is_active,
            ],
        ]);
    }

    public function update(Request $request, Region $region): RedirectResponse
    {
        $data = $this->validateRegion($request, $region->id);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $region->update($data);

        return redirect()
            ->route('admin.regions.edit', $region)
            ->with('success', 'Svæði uppfært.');
    }

    private function validateRegion(Request $request, ?int $regionId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}

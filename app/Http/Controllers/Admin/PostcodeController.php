<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Postcode;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostcodeController extends Controller
{
    public function index(Request $request): Response
    {
        $regionId = $request->integer('region_id');

        $postcodes = Postcode::query()
            ->with('region:id,name')
            ->when($regionId, fn ($query) => $query->where('region_id', $regionId))
            ->orderBy('code')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Postcode $postcode) => [
                'id' => $postcode->id,
                'code' => $postcode->code,
                'name' => $postcode->name,
                'is_active' => (bool) $postcode->is_active,
                'region' => $postcode->region ? [
                    'id' => $postcode->region->id,
                    'name' => $postcode->region->name,
                ] : null,
            ]);

        return Inertia::render('Admin/Postcodes/Index', [
            'filters' => [
                'region_id' => $regionId,
            ],
            'regions' => Region::query()->orderBy('name')->get(['id', 'name']),
            'postcodes' => $postcodes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Postcodes/Create', [
            'regions' => Region::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatePostcode($request);

        $postcode = Postcode::query()->create($data);

        return redirect()
            ->route('admin.postcodes.edit', $postcode)
            ->with('success', 'Póstnúmer stofnað.');
    }

    public function edit(Postcode $postcode): Response
    {
        return Inertia::render('Admin/Postcodes/Edit', [
            'postcode' => [
                'id' => $postcode->id,
                'code' => $postcode->code,
                'name' => $postcode->name,
                'region_id' => $postcode->region_id,
                'is_active' => (bool) $postcode->is_active,
            ],
            'regions' => Region::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Postcode $postcode): RedirectResponse
    {
        $data = $this->validatePostcode($request, $postcode->id);

        $postcode->update($data);

        return redirect()
            ->route('admin.postcodes.edit', $postcode)
            ->with('success', 'Póstnúmer uppfært.');
    }

    private function validatePostcode(Request $request, ?int $postcodeId = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:10', 'unique:postcodes,code,' . $postcodeId],
            'name' => ['required', 'string', 'max:255'],
            'region_id' => ['required', 'exists:regions,id'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}

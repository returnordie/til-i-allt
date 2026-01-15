<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $section = (string) $request->string('section', '');

        $categories = Category::query()
            ->with(['parent:id,name'])
            ->when($section !== '', fn ($query) => $query->where('section', $section))
            ->orderBy('section')
            ->orderBy('sort_order')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'section' => $category->section,
                'sort_order' => $category->sort_order,
                'is_active' => (bool) $category->is_active,
                'parent' => $category->parent ? [
                    'id' => $category->parent->id,
                    'name' => $category->parent->name,
                ] : null,
            ]);

        $sections = Category::query()
            ->select('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section')
            ->values();

        return Inertia::render('Admin/Categories/Index', [
            'filters' => [
                'section' => $section,
            ],
            'sections' => $sections,
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Create', [
            'sections' => $this->sections(),
            'parents' => $this->parents(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateCategory($request);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $category = Category::create($data);

        return redirect()
            ->route('admin.categories.edit', $category)
            ->with('success', 'Flokkur stofnaður.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'section' => $category->section,
                'parent_id' => $category->parent_id,
                'icon' => $category->icon,
                'hero_art' => $category->hero_art,
                'sort_order' => $category->sort_order,
                'is_active' => (bool) $category->is_active,
            ],
            'sections' => $this->sections(),
            'parents' => $this->parents($category->id),
        ]);
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $this->validateCategory($request, $category->id);

        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);

        $category->update($data);

        return redirect()
            ->route('admin.categories.edit', $category)
            ->with('success', 'Flokkur uppfærður.');
    }

    private function validateCategory(Request $request, ?int $categoryId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'section' => ['required', 'string', 'max:32'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'icon' => ['nullable', 'string', 'max:80'],
            'hero_art' => ['nullable', 'string', 'max:80'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    private function sections()
    {
        return Category::query()
            ->select('section')
            ->distinct()
            ->orderBy('section')
            ->pluck('section')
            ->values();
    }

    private function parents(?int $excludeId = null)
    {
        return Category::query()
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->orderBy('section')
            ->orderBy('name')
            ->get(['id', 'name', 'section']);
    }
}

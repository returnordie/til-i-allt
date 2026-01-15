<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
class SectionController extends Controller
{
    public function home()
    {
        return $this->section('solutorg');
    }

    public function section(string $section)
    {
        $first = Category::query()
            ->where('section', $section)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->first();

        if (! $first) {
            abort(404);
        }

        return redirect()->route('ads.index', [
            'section' => $section,
            'categorySlug' => $first->slug,
        ]);
    }

}

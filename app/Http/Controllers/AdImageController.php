<?php

namespace App\Http\Controllers;

use App\Models\AdImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
class AdImageController extends Controller
{
    public function show(Request $request, AdImage $adImage)
    {
        // Sækja ad með trashed (ef ad softdeletað)
        $ad = $adImage->ad()->withTrashed()->firstOrFail();

        $user = $request->user();

        $isOwnerOrAdmin = $user && ($user->id === $ad->user_id || $user->isAdmin());

        $isPublic = ($ad->status ?? 'active') === 'active' && $ad->deleted_at === null;

        if (! $isPublic && ! $isOwnerOrAdmin) {
            abort(404); // ekki leka að mynd sé til
        }

        $disk = $adImage->disk ?? 'ads';

        if (! Storage::disk($disk)->exists($adImage->path)) {
            abort(404);
        }

        $response = Storage::disk($disk)->response($adImage->path);

        // Forðast að browser/CDN cache-i gögn sem gætu orðið óaðgengileg
        $response->headers->set('Cache-Control', 'no-store, max-age=0');

        return $response;
    }
}

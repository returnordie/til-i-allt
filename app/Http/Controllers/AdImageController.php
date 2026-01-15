<?php

namespace App\Http\Controllers;

use App\Models\AdImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
class AdImageController extends Controller
{
    public function show(Request $request, AdImage $adImage)
    {
        $ad = $adImage->ad()->select(['id', 'user_id', 'status'])->firstOrFail();

        $user = $request->user();
        $isOwner = $user && (int)$user->id === (int)$ad->user_id;
        $isAdmin = $user && method_exists($user, 'isAdmin') ? (bool)$user->isAdmin() : false;

        // Public má ALDREI sjá soft-deleted myndir
        if ($adImage->trashed() && !$isOwner && !$isAdmin) {
            abort(404);
        }

        // Ef auglýsing er ekki active → aðeins owner/admin
        if ($ad->status !== 'active') {
            if (!$isOwner && !$isAdmin) {
                abort(404);
            }
        } else {
            // Auglýsing active → owner/admin mega, aðrir þurfa signed URL
            if (!$isOwner && !$isAdmin) {
                if (!$request->hasValidSignature()) {
                    abort(404);
                }
            }
        }

        $disk = Storage::disk($adImage->disk);

        if (!$disk->exists($adImage->path)) {
            abort(404);
        }

        return $disk->response($adImage->path, null, [
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'no-store, max-age=0',
        ]);
    }
}

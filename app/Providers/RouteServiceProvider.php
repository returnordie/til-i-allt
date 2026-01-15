<?php

namespace App\Providers;

use App\Models\AdImage;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Route::bind('adImage', function ($value) {
            return AdImage::withTrashed()
                ->where('public_id', $value)
                ->firstOrFail();
        });

        parent::boot();
    }
}

<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\AdController;
use App\Http\Controllers\AdReportController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\DealReviewController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AdImageController;


Route::get('/{section}/{categorySlug}', [AdController::class, 'index'])
    ->where('section', 'solutorg|bilatorg|fasteignir')
    ->name('ads.index');

Route::get('/{section}/{categorySlug}/{ad}-{slug?}', [AdController::class, 'show'])
    ->where('section', 'solutorg|bilatorg|fasteignir')
    ->whereNumber('ad')
    ->name('ads.show');

Route::middleware('auth')->group(function () {
    Route::get('/ads/create', [AdController::class, 'create'])->name('ads.create');
    Route::post('/ads', [AdController::class, 'store'])->name('ads.store');

    Route::get('/ads/{ad}/edit', [AdController::class, 'edit'])
        ->whereNumber('ad')
        ->middleware('can:update,ad')
        ->name('ads.edit');

    Route::put('/ads/{ad}', [AdController::class, 'update'])
        ->whereNumber('ad')
        ->middleware('can:update,ad')
        ->name('ads.update');

    Route::delete('/ads/{ad}', [AdController::class, 'destroy'])
        ->whereNumber('ad')
        ->middleware('can:delete,ad')
        ->name('ads.destroy');

    Route::post('/ads/{ad}/report', [AdReportController::class, 'store'])
        ->whereNumber('ad')
        ->middleware('can:report,ad')
        ->name('ads.report');

    Route::post('/ads/{ad}/deals', [DealController::class, 'store'])
        ->whereNumber('ad')
        ->middleware('can:createDeal,ad')
        ->name('deals.store');

    Route::post('/deals/{deal}/reviews', [DealReviewController::class, 'store'])
        ->whereNumber('deal')
        ->middleware('can:createReview,deal')
        ->name('deal-reviews.store');
});


Route::middleware('auth')->group(function () {
    Route::get('/spjall', [ConversationController::class, 'index'])->name('conversations.index');

    Route::get('/spjall/{conversation}', [ConversationController::class, 'show'])
        ->middleware('can:view,conversation')
        ->name('conversations.show');

    Route::post('/spjall/{conversation}/messages', [MessageController::class, 'store'])
        ->middleware('can:send,conversation')
        ->name('messages.store');
});

Route::middleware(['auth', 'can:admin'])->group(function () {
    // admin routes
});



Route::get('/i/{adImage}', [AdImageController::class, 'show'])->name('ad-images.show');


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

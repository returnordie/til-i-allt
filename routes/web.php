<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Account\AccountAdsController;
use App\Http\Controllers\AdController;
//use App\Http\Controllers\AdReportController;
//use App\Http\Controllers\DealController;
//use App\Http\Controllers\DealReviewController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\AdImageController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\Account\AccountSettingsController;
use App\Http\Controllers\Account\AccountNotificationController;
use App\Http\Controllers\Account\AccountPasswordController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
Route::get('/', [AdController::class, 'home'])->name('home');

Route::get('/{section}', [AdController::class, 'section'])
    ->whereIn('section', ['solutorg','bilatorg','fasteignir'])
    ->name('ads.section');


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



Route::get('/u/{user:username}', [UserProfileController::class, 'show'])
    ->name('users.show');

Route::middleware(['auth'])->prefix('mitt-svaedi')->group(function () {
    Route::get('stillingar', [AccountSettingsController::class, 'edit'])->name('account.settings.edit');
    Route::put('stillingar', [AccountSettingsController::class, 'update'])->name('account.settings.update');

    Route::get('tilkynningar', [AccountNotificationController::class, 'edit'])->name('account.notifications.edit');
    Route::put('tilkynningar', [AccountNotificationController::class, 'update'])->name('account.notifications.update');

    Route::get('oryggi', [AccountPasswordController::class, 'edit'])->name('account.security.edit');
    Route::put('oryggi/lykilord', [AccountPasswordController::class, 'update'])->name('account.security.password.update');

     Route::get('auglysingar', [AccountAdsController::class, 'index'])
        ->name('account.ads.index');

    Route::patch('auglysingar/{ad}/status', [AccountAdsController::class, 'setStatus'])
        ->name('account.ads.status');

    Route::patch('auglysingar/{ad}/extend', [AccountAdsController::class, 'extend'])
        ->name('account.ads.extend');



});

Route::middleware(['auth', 'can:admin'])->group(function () {
    // admin routes
});

use App\Http\Controllers\DealController;
use App\Http\Controllers\DealReviewController;

Route::middleware(['auth'])->group(function () {
    Route::post('/ads/{ad}/deals', [DealController::class, 'store'])->name('deals.store');

    Route::patch('/deals/{deal}/buyer', [DealController::class, 'setBuyer'])->name('deals.setBuyer');
    Route::patch('/deals/{deal}/status', [DealController::class, 'setStatus'])->name('deals.setStatus');

    Route::post('/deals/{deal}/reviews', [DealReviewController::class, 'store'])->name('dealReviews.store');
});



Route::get('/i/{adImage}', [AdImageController::class, 'show'])->name('ad-images.show');


Route::middleware(['auth'])->prefix('mitt-svaedi')->group(function () {
    Route::get('skilabod', [ConversationController::class, 'index'])->name('conversations.index');
    Route::get('skilabod/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');

    Route::patch('skilabod/{conversation}/read', [ConversationController::class, 'markRead'])->name('conversations.read');
    Route::patch('skilabod/{conversation}/archive', [ConversationController::class, 'toggleArchive'])->name('conversations.archive');
    Route::patch('skilabod/{conversation}/close', [ConversationController::class, 'close'])->name('conversations.close');
    Route::patch('skilabod/{conversation}/block', [ConversationController::class, 'block'])->name('conversations.block');

    Route::post('skilabod/{conversation}/messages', [MessageController::class, 'store'])->name('messages.store');

    // Support (valfrjálst núna)
    Route::post('skilabod/support', [ConversationController::class, 'startSupport'])->name('conversations.support.start');

    Route::get('tilkynningar/innbox', [AccountNotificationController::class, 'index'])
        ->name('notifications.inbox');

    Route::patch('tilkynningar/innbox/read-all', [AccountNotificationController::class, 'markAllRead'])
        ->name('notifications.readAll');

    // "Open" markar sem lesið og redirectar á data.url
    Route::get('tilkynningar/innbox/{notification}/open', [AccountNotificationController::class, 'open'])
        ->name('notifications.open');
});

// Starta / opna þráð frá auglýsingu
Route::middleware(['auth', 'verified'])->post('/ads/{ad}/skilabod', [ConversationController::class, 'startForAd'])
    ->name('conversations.startForAd');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

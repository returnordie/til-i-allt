<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Account\AccountAdsController;
use App\Http\Controllers\Account\AccountDealsController;
use App\Http\Controllers\AdController;
//use App\Http\Controllers\AdReportController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\DealReviewController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\AdImageController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\Account\AccountSettingsController;
use App\Http\Controllers\Account\AccountNotificationController;
use App\Http\Controllers\Account\AccountPasswordController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Admin\AdController as AdminAdController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PostcodeController as AdminPostcodeController;
use App\Http\Controllers\Admin\RegionController as AdminRegionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
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

    Route::get('vidskipti', [AccountDealsController::class, 'index'])
        ->name('account.deals.index');

    Route::get('vidskipti/{deal}/umsogn', [DealReviewController::class, 'create'])
        ->middleware('can:view,deal')
        ->name('account.deals.review');

    Route::patch('auglysingar/{ad}/status', [AccountAdsController::class, 'setStatus'])
        ->name('account.ads.status');

    Route::patch('auglysingar/{ad}/extend', [AccountAdsController::class, 'extend'])
        ->name('account.ads.extend');



});

Route::middleware(['auth', 'can:admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');

        Route::get('/ads', [AdminAdController::class, 'index'])->name('ads.index');
        Route::get('/ads/{ad}/edit', [AdminAdController::class, 'edit'])->name('ads.edit');
        Route::put('/ads/{ad}', [AdminAdController::class, 'update'])->name('ads.update');

        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [AdminCategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');

        Route::get('/regions', [AdminRegionController::class, 'index'])->name('regions.index');
        Route::get('/regions/create', [AdminRegionController::class, 'create'])->name('regions.create');
        Route::post('/regions', [AdminRegionController::class, 'store'])->name('regions.store');
        Route::get('/regions/{region}/edit', [AdminRegionController::class, 'edit'])->name('regions.edit');
        Route::put('/regions/{region}', [AdminRegionController::class, 'update'])->name('regions.update');

        Route::get('/postcodes', [AdminPostcodeController::class, 'index'])->name('postcodes.index');
        Route::get('/postcodes/create', [AdminPostcodeController::class, 'create'])->name('postcodes.create');
        Route::post('/postcodes', [AdminPostcodeController::class, 'store'])->name('postcodes.store');
        Route::get('/postcodes/{postcode}/edit', [AdminPostcodeController::class, 'edit'])->name('postcodes.edit');
        Route::put('/postcodes/{postcode}', [AdminPostcodeController::class, 'update'])->name('postcodes.update');
    });
});

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

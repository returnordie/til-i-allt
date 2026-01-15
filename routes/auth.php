<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
Route::get('nyskraning', [RegisteredUserController::class, 'create'])->name('register');
Route::post('nyskraning', [RegisteredUserController::class, 'store']);

Route::get('innskraning', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('innskraning', [AuthenticatedSessionController::class, 'store']);

Route::get('gleymt-lykilord', [PasswordResetLinkController::class, 'create'])->name('password.request');
Route::post('gleymt-lykilord', [PasswordResetLinkController::class, 'store'])->name('password.email');

Route::get('endurstilla-lykilord/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
Route::post('endurstilla-lykilord', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::middleware('auth')->group(function () {
Route::get('stadfesta-netfang', EmailVerificationPromptController::class)->name('verification.notice');

Route::get('stadfesta-netfang/{id}/{hash}', VerifyEmailController::class)
->middleware(['signed', 'throttle:6,1'])
->name('verification.verify');

Route::post('netfang/stadfesting-senda-aftur', [EmailVerificationNotificationController::class, 'store'])
->middleware('throttle:6,1')
->name('verification.send');

Route::get('stadfesta-lykilord', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
Route::post('stadfesta-lykilord', [ConfirmablePasswordController::class, 'store']);

Route::put('lykilord', [PasswordController::class, 'update'])->name('password.update');

Route::post('utskra', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

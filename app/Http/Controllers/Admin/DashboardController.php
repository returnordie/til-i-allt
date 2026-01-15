<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\Deal;
use App\Models\Postcode;
use App\Models\Region;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $recentUsers = User::query()
            ->latest()
            ->limit(6)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $recentAds = Ad::query()
            ->with(['user:id,name'])
            ->latest()
            ->limit(6)
            ->get(['id', 'user_id', 'title', 'status', 'price', 'currency', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'users' => User::count(),
                'ads' => Ad::count(),
                'categories' => Category::count(),
                'regions' => Region::count(),
                'postcodes' => Postcode::count(),
                'deals' => Deal::count(),
                'conversations' => Conversation::count(),
            ],
            'recentUsers' => $recentUsers->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at?->toDateTimeString(),
            ]),
            'recentAds' => $recentAds->map(fn (Ad $ad) => [
                'id' => $ad->id,
                'title' => $ad->title,
                'status' => $ad->status,
                'price' => $ad->price,
                'currency' => $ad->currency,
                'created_at' => $ad->created_at?->toDateTimeString(),
                'user' => [
                    'id' => $ad->user?->id,
                    'name' => $ad->user?->name,
                ],
            ]),
        ]);
    }
}

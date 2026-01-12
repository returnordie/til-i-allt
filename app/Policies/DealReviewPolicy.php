<?php

namespace App\Policies;

use App\Models\Deal;
use App\Models\DealReview;
use App\Models\User;

class DealReviewPolicy
{
    public function create(User $user, Deal $deal): bool
    {
        // Delegate-a til DealPolicy í controller með can('createReview', $deal)
        return true;
    }

    public function delete(User $user, DealReview $review): bool
    {
        return $user->isAdmin();
    }
}

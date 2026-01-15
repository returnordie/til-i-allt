<?php

namespace App\Policies;

use App\Models\Deal;
use App\Models\User;

class DealPolicy
{
    public function view(User $user, Deal $deal): bool
    {
        return $user->isAdmin()
            || $deal->seller_id === $user->id
            || $deal->buyer_id === $user->id;
    }

    public function update(User $user, Deal $deal): bool
    {
        // MVP: báðir aðilar mega breyta innan ramma controller/service
        return $this->view($user, $deal);
    }

    public function createReview(User $user, Deal $deal): bool
    {
        if (! $this->view($user, $deal)) {
            return false;
        }

        if ($deal->status !== 'completed') {
            return false;
        }

        if (! $deal->buyer_id) {
            return false;
        }

        return $deal->reviewsAreOpen();
    }
}

<?php

namespace App\Policies;

use App\Models\Ad;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AdPolicy
{
    public function view(?User $user, Ad $ad): bool
    {
        // MVP: allir mega skoða, nema ef þú vilt fela draft/softdeleted í controller/query.
        return true;
    }
    public function create(User $user): bool
    {
        return $user->is_active ?? true;
    }

    public function update(User $user, Ad $ad): bool
    {
        return $user->isAdmin() || $ad->user_id === $user->id;
    }

    public function delete(User $user, Ad $ad): bool
    {
        return $user->isAdmin() || $ad->user_id === $user->id;
    }

    public function report(User $user, Ad $ad): bool
    {
        return $ad->user_id !== $user->id;
    }

    public function createDeal(User $user, Ad $ad): bool
    {
        // Aðeins seljandi (eigandi auglýsingar) opnar deal
        return $user->isAdmin() || $ad->user_id === $user->id;
    }

    public function markSold(User $user, Ad $ad): bool
    {
        return $user->isAdmin() || $ad->user_id === $user->id;
    }
}

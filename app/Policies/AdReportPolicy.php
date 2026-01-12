<?php

namespace App\Policies;

use App\Models\AdReport;
use App\Models\User;

class AdReportPolicy
{
    public function view(User $user, AdReport $report): bool
    {
        return $user->isAdmin() || $report->reporter_id === $user->id;
    }

    public function handle(User $user, AdReport $report): bool
    {
        return $user->isAdmin();
    }
}

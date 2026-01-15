<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class PruneNotifications extends Command
{
    protected $signature = 'tia:notifications-prune';
    protected $description = 'Soft-deletes notifications older than configured days';

    public function handle(): int
    {
        $days = (int) config('tia.notifications_prune_days', 10);
        $cutoff = now()->subDays($days);

        $count = Notification::query()
            ->whereNull('deleted_at')
            ->where('created_at', '<', $cutoff)
            ->update(['deleted_at' => now()]);

        $this->info("Soft-deleted {$count} notifications older than {$days} days.");

        return self::SUCCESS;
    }
}

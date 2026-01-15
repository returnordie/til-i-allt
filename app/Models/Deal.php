<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Deal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ad_id',
        'seller_id',
        'buyer_id',
        'status',
        'price_final',
        'currency',
        'confirmed_at',
        'completed_at',
        'canceled_at',
        'meta',
    ];

    protected $casts = [
        'confirmed_at' => 'datetime',
        'completed_at' => 'datetime',
        'canceled_at' => 'datetime',
        'meta' => 'array',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function reviews()
    {
        return $this->hasMany(DealReview::class);
    }

    public function reviewsOpenAt()
    {
        if (!$this->completed_at) {
            return null;
        }

        $delayHours = (int) config('tia.deal_review_delay_hours', 0);

        return $this->completed_at->copy()->addHours(max(0, $delayHours));
    }

    public function reviewsAreOpen(): bool
    {
        if (!$this->completed_at) {
            return false;
        }

        $openAt = $this->reviewsOpenAt();
        if (!$openAt) {
            return false;
        }

        $windowEndsAt = $this->completed_at->copy()->addDays(14);

        if ($openAt->greaterThan($windowEndsAt)) {
            return false;
        }

        return now()->betweenIncluded($openAt, $windowEndsAt);
    }

    public function isParticipant(int $userId): bool
    {
        return $userId === (int) $this->seller_id || $userId === (int) $this->buyer_id;
    }
}

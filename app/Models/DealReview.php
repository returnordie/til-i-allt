<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DealReview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'deal_id',
        'rater_id',
        'ratee_id',
        'rating',
        'comment',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    public function ratee()
    {
        return $this->belongsTo(User::class, 'ratee_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class DealReview extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'deal_id',
        'rater_id',
        'ratee_id',
        'rating',
        'comment',
        'meta',
    ];

    protected $casts = [
        'rating' => 'integer',
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

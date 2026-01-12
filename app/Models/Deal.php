<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Deal extends Model
{
    use HasFactory, SoftDeletes;

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
        'price_final' => 'integer',
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
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class AdPromotion extends Model
{
    use HasFactory, SoftDeletes;

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ad_id',
        'type',
        'starts_at',
        'ends_at',
        'priority',
        'status',
        'amount',
        'currency',
        'provider',
        'provider_ref',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'priority' => 'integer',
        'amount' => 'integer',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

}

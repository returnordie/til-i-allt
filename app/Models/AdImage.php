<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdImage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ad_id',
        'path',
        'disk',
        'sort_order',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

}

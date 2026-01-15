<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

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

    protected static function booted(): void
    {
        static::creating(function (self $img) {
            if (empty($img->public_id)) {
                $img->public_id = (string) Str::ulid();
            }
        });
    }

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }
}

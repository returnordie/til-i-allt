<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Ad extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'section',
        'listing_type',      // eða listing_type – eftir því hvað þú valdir
        'title',
        'slug',
        'description',
        'price',
        'currency',
        'negotiable',
        'location_text',
        'status',
        'published_at',
        'expires_at',
        'views_count',
        'meta',
    ];

    protected $casts = [
        'negotiable' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'meta' => 'array',
        'price' => 'integer',
        'views_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(AdImage::class)->orderBy('sort_order');
    }

    public function promotions()
    {
        return $this->hasMany(AdPromotion::class);
    }

    public function uniqueViews()
    {
        return $this->hasMany(AdViewUnique::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (Ad $ad) {
            // Soft delete cascade (FK gerir þetta ekki)
            if (! $ad->isForceDeleting()) {
                $ad->images()->delete();
                $ad->promotions()->delete();
                return;
            }

            // Force delete flow (ef þú notar admin forceDelete seinna)
            $ad->images()->withTrashed()->forceDelete();
            $ad->promotions()->withTrashed()->forceDelete();
        });

        static::restoring(function (Ad $ad) {
            $ad->images()->withTrashed()->restore();
            $ad->promotions()->withTrashed()->restore();
        });
    }
}

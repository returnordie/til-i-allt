<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'parent_id',
        'section',
        'hero_art',
        'name',
        'slug',
        'icon',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    public function attributes()
    {
        return $this->belongsToMany(\App\Models\AttributeDefinition::class, 'category_attribute')
            ->withPivot(['required','sort_order'])
            ->orderByPivot('sort_order');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeDefinition extends Model
{
    protected $fillable = ['key','label','type','options','unit','placeholder','help','group'];

    protected $casts = [
        'options' => 'array',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_attribute')
            ->withPivot(['required','sort_order'])
            ->orderByPivot('sort_order');
    }
}

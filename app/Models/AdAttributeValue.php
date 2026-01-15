<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdAttributeValue extends Model
{
    protected $fillable = [
        'ad_id','attribute_definition_id',
        'value_text','value_number','value_bool','value_json'
    ];

    protected $casts = [
        'value_bool' => 'boolean',
        'value_json' => 'array',
    ];

    public function definition()
    {
        return $this->belongsTo(AttributeDefinition::class, 'attribute_definition_id');
    }
}

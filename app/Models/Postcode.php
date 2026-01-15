<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postcode extends Model
{
    protected $fillable = [
        'code',
        'name',
        'region_id',
        'is_active',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }
}

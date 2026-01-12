<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AdEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'ad_id','actor_id','event','from_status','to_status','meta','ip_hash','ua_hash'
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function ad() { return $this->belongsTo(Ad::class); }
    public function actor() { return $this->belongsTo(User::class, 'actor_id'); }
}

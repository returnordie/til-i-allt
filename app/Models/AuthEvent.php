<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class AuthEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','event','guard','ip_hash','ua_hash','identifier_hash','meta','occurred_at'
    ];

    protected $casts = [
        'meta' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }
}

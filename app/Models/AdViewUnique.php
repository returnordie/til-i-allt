<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AdViewUnique extends Model
{
    use HasFactory;

    protected $table = 'ad_view_uniques';

    protected $fillable = [
        'ad_id',
        'user_id',
        'viewer_hash',
        'viewed_on',
        'ip_hash',
        'ua_hash',
    ];

    protected $casts = [
        'ad_id' => 'integer',
        'user_id' => 'integer',
        'viewed_on' => 'date',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }}

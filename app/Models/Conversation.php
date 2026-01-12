<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ad_id',
        'owner_id',
        'member_id',
        'status',
        'last_message_at',
        'owner_last_read_at',
        'member_last_read_at',
        'owner_archived_at',
        'member_archived_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'owner_last_read_at' => 'datetime',
        'member_last_read_at' => 'datetime',
        'owner_archived_at' => 'datetime',
        'member_archived_at' => 'datetime',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
}

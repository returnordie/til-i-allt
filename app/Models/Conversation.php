<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ad_id',
        'owner_id',
        'member_id',
        'status',
        'context',
        'subject',
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

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function otherUserFor(int $userId): ?User
    {
        if ($this->owner_id === $userId) return $this->member;
        if ($this->member_id === $userId) return $this->owner;
        return null;
    }

    public function lastReadAtFor(int $userId)
    {
        return $this->owner_id === $userId ? $this->owner_last_read_at : $this->member_last_read_at;
    }

    public function archivedAtFor(int $userId)
    {
        return $this->owner_id === $userId ? $this->owner_archived_at : $this->member_archived_at;
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'username_changed_at',
        'phone_e164',
        'date_of_birth',

        'show_phone',
        'show_name',

        'preferred_contact_method',
        'best_call_time',
        'contact_note',

        'email_on_message',
        'email_on_notifications',
        'email_on_system',
        'email_on_ad_expiring',
        'email_on_ad_expired',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'date_of_birth' => 'date',
            'username_changed_at' => 'datetime',

            'show_phone' => 'boolean',
            'show_name' => 'boolean',
            'is_system' => 'boolean',
            'is_active' => 'boolean',

            'last_login_at' => 'datetime',
            'banned_at' => 'datetime',

            'email_on_message' => 'boolean',
            'email_on_notifications' => 'boolean',
            'email_on_system' => 'boolean',
            'email_on_ad_expiring' => 'boolean',
            'email_on_ad_expired' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return ($this->role ?? null) === 'admin';
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable')
            ->whereNull('deleted_at')
            ->orderByDesc('created_at');
    }

    public function readNotifications(): MorphMany
    {
        return $this->notifications()->whereNotNull('read_at');
    }

    public function unreadNotifications(): MorphMany
    {
        return $this->notifications()->whereNull('read_at');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class Notification extends BaseDatabaseNotification
{
    use SoftDeletes;

    protected $table = 'notifications';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}

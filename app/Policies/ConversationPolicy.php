<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin()
            || $conversation->owner_id === $user->id
            || $conversation->member_id === $user->id;
    }

    public function send(User $user, Conversation $conversation): bool
    {
        if (! $this->view($user, $conversation)) {
            return false;
        }

        return ($conversation->status ?? 'open') === 'open';
    }

    public function archive(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }

    public function update(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}

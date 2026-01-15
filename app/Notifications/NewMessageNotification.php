<?php

namespace App\Notifications;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Conversation $conversation,
        public Message $message,
        public User $sender
    ) {}

    public function via(object $notifiable): array
    {
        // database notifications (in-app)
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $adTitle = $this->conversation->ad?->title;
        $title = $adTitle ? "Ný skilaboð: {$adTitle}" : 'Ný skilaboð';
        $body = mb_strimwidth($this->message->body, 0, 140, '…');

        return [
            'kind' => 'message',
            'title' => $title,
            'body' => $body,

            'conversation_id' => $this->conversation->id,
            'message_id' => $this->message->id,

            'from_user_id' => $this->sender->id,
            'from_name' => $this->sender->name,

            'ad_id' => $this->conversation->ad_id,
            'ad_title' => $adTitle,

            'url' => route('conversations.show', $this->conversation),
        ];
    }
}

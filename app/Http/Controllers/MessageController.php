<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use App\Models\User;

class MessageController extends Controller
{

    public function store(StoreMessageRequest $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('view', $conversation);

        if ($conversation->status !== 'open') {
            return back()->with('error', 'Þessi þráður er ekki opinn.');
        }

        $user = $request->user();

        $msg = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->validated()['body'],
            'message_type' => 'user',
        ]);

        // Update conversation metadata
        $now = now();
        $conversation->last_message_at = $now;

        // Sender has read
        if ($conversation->owner_id === $user->id) {
            $conversation->owner_last_read_at = $now;
            // unarchive for recipient
            $conversation->member_archived_at = null;
        } else {
            $conversation->member_last_read_at = $now;
            $conversation->owner_archived_at = null;
        }

        $recipientId = $conversation->owner_id === $user->id
            ? $conversation->member_id
            : $conversation->owner_id;

        $recipient = User::find($recipientId);

        $conversation->save();

        // Email notifications (seinna): tengjum við email_on_message þegar þú vilt.

        return back();
    }
}

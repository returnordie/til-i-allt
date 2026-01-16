<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConversationStatusRequest;
use App\Models\Ad;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Deal;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filter = (string) $request->string('filter', 'inbox'); // inbox|archived|all
        $q = trim((string) $request->string('q', ''));

        $query = Conversation::query()
            ->where(function ($qq) use ($user) {
                $qq->where('owner_id', $user->id)->orWhere('member_id', $user->id);
            })
            ->with([
                'ad:id,title,slug,section,category_id,status,expires_at',
                'ad.category:id,slug,name',
                'owner:id,name,username,show_name',
                'member:id,name,username,show_name',
                'latestMessage.sender:id,name',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $this->applyConversationFilter($query, $user, $filter);

        if ($q !== '') {
            $query->where(function ($qq) use ($q) {
                $qq->where('subject', 'like', "%{$q}%");
            });
        }

        $conversations = $query
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Conversation $c) => $this->formatConversationRow($c, $user));

        return Inertia::render('Conversations/Index', [
            'filters' => ['filter' => $filter, 'q' => $q],
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorize('view', $conversation);
        $filter = (string) $request->string('filter', 'inbox');

        // Mark read when opening
        $this->markReadInternal($request->user(), $conversation);

        $conversation->load([
            'ad:id,title,slug,section,category_id,status,expires_at',
            'ad.category:id,slug,name',
            'owner:id,name,username,show_name',
            'member:id,name,username,show_name',
        ]);

        $user = $request->user();
        $other = $conversation->otherUserFor($user->id);

        // IMPORTANT: nýjustu 50 fyrst (page=1), en UI röð (old->new)
        $messages = $conversation->messages()
            ->whereNull('deleted_at')
            ->with('sender:id,name')
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        $messages->setCollection(
            $messages->getCollection()->reverse()->values()
        );

        $messages = $messages->through(function ($m) {
            return [
                'id' => $m->id,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender?->name,
                'body' => $m->body,
                'message_type' => $m->message_type,
                'created_at' => $m->created_at?->toDateTimeString(),
            ];
        });

        // DEAL (bara fyrir ad-context)
        $isAdContext = $conversation->context === 'ad' && $conversation->ad;
        $isSeller = (int) $conversation->owner_id === (int) $user->id;

        $deal = null;

        if ($isAdContext) {
            $dealModel = Deal::query()
                ->where('ad_id', $conversation->ad_id)
                ->where('seller_id', $conversation->owner_id)
                ->latest('id')
                ->first();

            $deal = [
                'id' => $dealModel?->id,
                'status' => $dealModel?->status ?? 'active',
                'buyer_id' => $dealModel?->buyer_id,
                'price_final' => $dealModel?->price_final,
                'currency' => $dealModel?->currency ?? 'ISK',
                'confirmed_at' => $dealModel?->confirmed_at?->toDateTimeString(),

                // UI rules
                'can_mark_buyer' => $isSeller && (bool) $other, // seller + other user exists

                // links
                'links' => [
                    // POST /ads/{ad}/deals  (upsert logic í DealController)
                    'upsert' => route('deals.store', $conversation->ad),
                    // aðeins ef deal er til
                    'set_buyer' => $dealModel ? route('deals.setBuyer', $dealModel) : null,
                    'set_status' => $dealModel ? route('deals.setStatus', $dealModel) : null,
                ],
            ];
        }

        $archivedByOther = (bool) ($conversation->owner_id === $user->id
            ? $conversation->member_archived_at
            : $conversation->owner_archived_at);

        return Inertia::render('Conversations/Show', [
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'context' => $conversation->context,
                'subject' => $conversation->subject,

                'other' => $other ? [
                    'id' => $other->id,
                    'name' => $other->name,
                    'username' => $other->username,
                    'show_name' => (bool) $other->show_name,
                ] : null,

                'ad' => $conversation->ad ? [
                    'title' => $conversation->ad->title,
                    'link' => route('ads.show', [
                        'section' => $conversation->ad->section,
                        'categorySlug' => $conversation->ad->category?->slug,
                        'ad' => $conversation->ad->id,
                        'slug' => $conversation->ad->slug,
                    ]),
                ] : null,

                'is_archived' => (bool) $conversation->archivedAtFor($user->id),
                'is_archived_by_other' => $archivedByOther,
                'links' => [
                    'archive' => route('conversations.archive', $conversation),
                    'close' => route('conversations.close', $conversation),
                    'block' => route('conversations.block', $conversation),
                    'send' => route('messages.store', $conversation),
                ],
            ],
            'messages' => $messages,
            'authUserId' => $user->id,

            // NEW
            'deal' => $deal,
            'conversationList' => $this->conversationListFor($user, $filter),
            'filters' => ['filter' => $filter],
        ]);
    }

    public function latest(Request $request): RedirectResponse
    {
        $user = $request->user();
        $filter = (string) $request->string('filter', 'inbox');

        $query = Conversation::query()
            ->where(function ($qq) use ($user) {
                $qq->where('owner_id', $user->id)->orWhere('member_id', $user->id);
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $this->applyConversationFilter($query, $user, $filter);

        $conversation = $query->first();

        if (!$conversation) {
            return redirect()->route('conversations.index', ['filter' => $filter]);
        }

        return redirect()->route('conversations.show', [$conversation, 'filter' => $filter]);
    }


    public function startForAd(Request $request, Ad $ad): RedirectResponse
    {
        $user = $request->user();

        // Ekki senda skilaboð sjálfum sér
        if ($ad->user_id === $user->id) {
            return back()->with('error', 'Þú getur ekki sent skilaboð á þína eigin auglýsingu.');
        }

        // Nýtt samtal aðeins ef auglýsing er virk og ekki útrunnin (MVP regla)
        if ($ad->status !== 'active' || ($ad->expires_at && $ad->expires_at->isPast())) {
            return back()->with('error', 'Ekki hægt að hefja nýtt samtal nema auglýsing sé virk.');
        }

        $conversation = Conversation::query()
            ->where('context', 'ad')
            ->where('ad_id', $ad->id)
            ->where('member_id', $user->id)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'context' => 'ad',
                'ad_id' => $ad->id,
                'owner_id' => $ad->user_id,
                'member_id' => $user->id,
                'status' => 'open',
                'subject' => $ad->title,
            ]);
        }

        return redirect()->route('conversations.show', $conversation);
    }

    public function startSupport(Request $request): RedirectResponse
    {
        $user = $request->user();

        $system = User::query()->where('is_system', true)->first();
        if (!$system) {
            return back()->with('error', 'Support er ekki virkt ennþá.');
        }

        // Find-or-create (þar sem unique með NULL er ekki tryggt)
        $conversation = Conversation::query()
            ->where('context', 'support')
            ->whereNull('ad_id')
            ->where('member_id', $user->id)
            ->where('owner_id', $system->id)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'context' => 'support',
                'ad_id' => null,
                'owner_id' => $system->id,
                'member_id' => $user->id,
                'status' => 'open',
                'subject' => 'Support',
            ]);
        }

        return redirect()->route('conversations.show', $conversation);
    }

    public function markRead(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('view', $conversation);
        $this->markReadInternal($request->user(), $conversation);

        return back();
    }

    public function toggleArchive(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('update', $conversation);

        $user = $request->user();
        $now = now();

        if ($conversation->owner_id === $user->id) {
            $conversation->owner_archived_at = $conversation->owner_archived_at ? null : $now;
        } else {
            $conversation->member_archived_at = $conversation->member_archived_at ? null : $now;
        }

        $conversation->save();

        return back()->with('success', 'Uppfært.');
    }

    public function close(UpdateConversationStatusRequest $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('update', $conversation);

        $conversation->status = 'closed';
        $conversation->save();

        return back()->with('success', 'Þráður lokaður.');
    }

    public function block(UpdateConversationStatusRequest $request, Conversation $conversation): RedirectResponse
    {
        $this->authorize('update', $conversation);

        $conversation->status = 'blocked';
        $conversation->save();

        return back()->with('success', 'Þráður blokkaður.');
    }

    private function markReadInternal($user, Conversation $conversation): void
    {
        $now = now();

        if ($conversation->owner_id === $user->id) {
            $conversation->owner_last_read_at = $now;
        } else {
            $conversation->member_last_read_at = $now;
        }

        $conversation->save();
    }

    private function conversationListFor(User $user, string $filter)
    {
        $query = Conversation::query()
            ->where(function ($qq) use ($user) {
                $qq->where('owner_id', $user->id)->orWhere('member_id', $user->id);
            })
            ->with([
                'ad:id,title,slug,section,category_id,status,expires_at',
                'ad.category:id,slug,name',
                'owner:id,name,username,show_name',
                'member:id,name,username,show_name',
                'latestMessage.sender:id,name',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $this->applyConversationFilter($query, $user, $filter);

        return $query
            ->limit(20)
            ->get()
            ->map(fn (Conversation $c) => $this->formatConversationRow($c, $user))
            ->values();
    }

    private function formatConversationRow(Conversation $conversation, User $user): array
    {
        $other = $conversation->otherUserFor($user->id);

        $lastRead = $conversation->lastReadAtFor($user->id);
        $unread = $conversation->last_message_at && (!$lastRead || $conversation->last_message_at->gt($lastRead));

        $lastBody = $conversation->latestMessage?->body;
        $snippet = $lastBody ? mb_strimwidth($lastBody, 0, 90, '…') : null;

        $adTitle = $conversation->ad?->title;
        $adLink = $conversation->ad ? route('ads.show', [
            'section' => $conversation->ad->section,
            'categorySlug' => $conversation->ad->category?->slug,
            'ad' => $conversation->ad->id,
            'slug' => $conversation->ad->slug,
        ]) : null;

        return [
            'id' => $conversation->id,
            'status' => $conversation->status,
            'context' => $conversation->context,
            'subject' => $conversation->subject,
            'last_message_at' => $conversation->last_message_at?->toDateTimeString(),
            'unread' => $unread,

            'other' => $other ? [
                'id' => $other->id,
                'name' => $other->name,
                'username' => $other->username,
                'show_name' => (bool) $other->show_name,
            ] : null,

            'ad' => $conversation->ad ? [
                'title' => $adTitle,
                'link' => $adLink,
            ] : null,

            'snippet' => $snippet,

            'links' => [
                'show' => route('conversations.show', $conversation),
            ],
        ];
    }

    private function applyConversationFilter(Builder $query, User $user, string $filter): void
    {
        if ($filter === 'inbox') {
            $query->where(function ($qq) use ($user) {
                $qq->where(function ($q) use ($user) {
                    $q->where('owner_id', $user->id)->whereNull('owner_archived_at');
                })->orWhere(function ($q) use ($user) {
                    $q->where('member_id', $user->id)->whereNull('member_archived_at');
                });
            });
        } elseif ($filter === 'archived') {
            $query->where(function ($qq) use ($user) {
                $qq->where(function ($q) use ($user) {
                    $q->where('owner_id', $user->id)->whereNotNull('owner_archived_at');
                })->orWhere(function ($q) use ($user) {
                    $q->where('member_id', $user->id)->whereNotNull('member_archived_at');
                });
            });
        }
    }
}

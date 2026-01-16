import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Msg = {
    id: number;
    sender_id: number;
    sender_name: string | null;
    body: string;
    message_type: string;
    created_at: string | null;
};

type DealProps = null | {
    id: number | null;
    status: 'active' | 'inactive' | 'completed' | string;
    buyer_id: number | null;
    price_final: number | null;
    currency: string;
    confirmed_at: string | null;
    can_mark_buyer: boolean;
    links: {
        upsert: string;
        set_buyer: string | null;
        set_status: string | null;
    };
};

type PageProps = {
    authUserId: number;
    conversation: {
        id: number;
        status: 'open' | 'closed' | 'blocked';
        context: string;
        subject: string | null;
        other: { id: number; name: string; username: string | null; show_name: boolean } | null;
        ad: { title: string; link: string } | null;
        is_archived: boolean;
        is_archived_by_other: boolean;
        links: { archive: string; close: string; block: string; send: string };
    };
    conversationList: Array<{
        id: number;
        status: string;
        context: string;
        subject: string | null;
        last_message_at: string | null;
        unread: boolean;
        snippet: string | null;
        other: { name: string; username: string | null; show_name: boolean } | null;
        ad: { title: string; link: string | null } | null;
        links: { show: string };
    }>;
    messages: {
        data: Msg[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    deal: DealProps;
    filters: { filter: string };
    flash?: { success?: string; error?: string };
};

function fmtTime(s: string | null) {
    if (!s) return '';
    return new Date(s).toLocaleString('is-IS');
}

function displayName(user: { name: string; username: string | null; show_name: boolean } | null) {
    if (!user) return '—';
    return user.show_name ? user.name : (user.username ?? user.name);
}

export default function Show() {
    const { props } = usePage<PageProps>();
    const { conversation, messages, authUserId, deal, conversationList, filters } = props;
    const [isListOpen, setIsListOpen] = useState(false);
    const otherDisplayName = conversation.other ? displayName(conversation.other) : '';

    // --- scroll to bottom behavior (no live chat) ---
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const justSentRef = useRef(false);

    const lastMsgId = useMemo(() => {
        const last = messages.data?.[messages.data.length - 1];
        return last?.id ?? null;
    }, [messages.data]);

    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior });
    };

    useEffect(() => {
        requestAnimationFrame(() => scrollToBottom('auto'));
    }, [conversation.id]);

    useEffect(() => {
        if (!justSentRef.current) return;
        justSentRef.current = false;
        requestAnimationFrame(() => scrollToBottom('smooth'));
    }, [lastMsgId]);

    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const isChatArchived = conversation.is_archived || conversation.is_archived_by_other;
    const isChatClosed = conversation.status === 'closed' || isChatArchived;
    const isChatBlocked = conversation.status === 'blocked';
    const canSendMessage = conversation.status === 'open' && !isChatArchived;

    useEffect(() => {
        if (showArchiveModal) {
            document.body.classList.add('modal-open');
            return () => document.body.classList.remove('modal-open');
        }
        document.body.classList.remove('modal-open');
        return undefined;
    }, [showArchiveModal]);

    const send = (e?: React.FormEvent) => {
        e?.preventDefault();
        justSentRef.current = true;

        post(conversation.links.send, {
            preserveScroll: true,
            onSuccess: () => reset('body'),
            onError: () => {
                justSentRef.current = false;
            },
        });
    };

    // --- deal actions (mark buyer) ---
    const canShowDealBox = Boolean(deal) && conversation.context === 'ad';
    const canMarkBuyer = Boolean(deal?.can_mark_buyer) && Boolean(conversation.other?.id);
    const isSeller = Boolean(deal?.can_mark_buyer);
    const buyerMarked = deal?.buyer_id === authUserId;
    const soldToOther = deal?.status === 'completed' && deal?.buyer_id !== authUserId;
    const showBuyerStatus = !isSeller && canShowDealBox && (buyerMarked || soldToOther);
    const canManageDeal = canShowDealBox && canMarkBuyer && deal?.status !== 'completed';

    const buyerMarkedAt = deal?.confirmed_at ? new Date(deal.confirmed_at).getTime() : null;
    const buyerMarkExpired = buyerMarkedAt ? Date.now() - buyerMarkedAt > 24 * 60 * 60 * 1000 : false;

    const markBuyer = () => {
        if (!deal?.links.upsert || !conversation.other?.id) return;

        router.post(
            deal.links.upsert,
            { buyer_id: conversation.other.id },
            { preserveScroll: true }
        );
    };

    const clearBuyer = () => {
        if (!deal) return;

        if (deal.links.set_buyer) {
            router.patch(deal.links.set_buyer, { buyer_id: null }, { preserveScroll: true });
            return;
        }

        // fallback: upsert með buyer_id null
        router.post(deal.links.upsert, { buyer_id: null }, { preserveScroll: true });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Skilaboð" />

            <div className="container py-4">
                <div className="row justify-content-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
                    <div
                        className={`col-12 col-lg-4 col-xl-3 mb-3 mb-lg-0 ${isListOpen ? 'd-flex' : 'd-none d-lg-flex'}`}
                        style={{ minHeight: 'calc(100vh - 180px)' }}
                    >
                        <div className="card h-100 flex-column d-flex">
                            {isListOpen ? (
                                <div className="d-flex align-items-center justify-content-end gap-2 border-bottom p-2 d-lg-none">
                                    <TTButton
                                        size="sm"
                                        variant="slate"
                                        look="ghost"
                                        onClick={() => setIsListOpen(false)}
                                    >
                                        Loka lista
                                    </TTButton>
                                </div>
                            ) : null}
                            <div className="border-bottom p-2">
                                <div className="d-flex flex-wrap gap-2">
                                    {['inbox', 'archived'].map((k) => {
                                        const active = filters.filter === k;
                                        return (
                                            <TTButton
                                                key={k}
                                                size="sm"
                                                variant="dark"
                                                look={active ? 'solid' : 'outline'}
                                                onClick={() =>
                                                    router.get(
                                                        route('conversations.show', conversation.id),
                                                        { filter: k },
                                                        { preserveState: true, preserveScroll: true }
                                                    )
                                                }
                                            >
                                                {k === 'inbox' ? 'Innhólf' : 'Lokuð skilaboð'}
                                            </TTButton>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="list-group list-group-flush flex-grow-1 overflow-auto">
                                {conversationList.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={route('conversations.show', { conversation: c.id, filter: filters.filter })}
                                        className={`list-group-item list-group-item-action ${c.id === conversation.id ? 'bg-light border border-1' : ''} ${c.unread ? 'fw-semibold' : ''}`}
                                    >
                                        <div className="d-flex justify-content-between gap-3">
                                            <div className="text-truncate">
                                                <div className="d-flex align-items-center gap-2">
                                                    {c.unread ? <span className="badge text-bg-danger">Nýtt</span> : null}
                                                    <span>{displayName(c.other)}</span>
                                                </div>
                                                {c.ad?.title ? (
                                                    <div className="text-muted small text-truncate">Vegna auglýsingar: {c.ad.title}</div>
                                                ) : (
                                                    <div className="text-muted small">{c.context === 'support' ? 'Support' : 'Þráður'}</div>
                                                )}
                                                {c.snippet ? <div className="text-muted small text-truncate">{c.snippet}</div> : null}
                                            </div>
                                            <div className="text-muted small text-nowrap">
                                                {fmtTime(c.last_message_at)}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {conversationList.length === 0 ? (
                                    <div className="list-group-item text-center text-muted py-5">Engin skilaboð.</div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-8 col-xl-9 d-flex flex-column" style={{ minHeight: 'calc(100vh - 180px)' }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                            <div>
                                <div className="h5 mb-0">{otherDisplayName || 'Skilaboð'}</div>
                                {conversation.ad?.title ? (
                                    <div className="text-muted small">
                                        Auglýsing: <a href={conversation.ad.link}>{conversation.ad.title}</a>
                                    </div>
                                ) : (
                                    <div className="text-muted small">
                                        {conversation.context === 'support' ? 'Support' : 'Þráður'}
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                <TTButton
                                    size="sm"
                                    variant="slate"
                                    look="ghost"
                                    className="d-lg-none"
                                    onClick={() => setIsListOpen((prev) => !prev)}
                                >
                                    Innhólf
                                </TTButton>
                                <TTButton
                                    size="sm"
                                    variant="amber"
                                    look="solid"
                                    onClick={() => {
                                        if (conversation.is_archived) {
                                            router.patch(conversation.links.archive, {}, { preserveScroll: true });
                                        } else {
                                            setShowArchiveModal(true);
                                        }
                                    }}
                                >
                                    {conversation.is_archived ? 'Opna fyrir spjall' : 'Loka spjalli'}
                                </TTButton>
                            </div>
                        </div>

                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        {showBuyerStatus ? (
                            <div className={`alert ${buyerMarked ? 'alert-success' : 'alert-warning'}`}>
                                {buyerMarked ? 'Þú hefur verið merkt/ur sem kaupandi.' : 'Varan hefur verið seld.'}
                            </div>
                        ) : null}

                        {/* DEAL box (merkja kaupanda) */}
                        {canManageDeal ? (
                            <div className="card mb-3">
                                <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div>
                                        <div className="fw-semibold">Viðskipti</div>
                                        <div className="small text-muted">Merkja eða afmerkja kaupanda.</div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <TTButton
                                            type="button"
                                            size="sm"
                                            variant="green"
                                            look="solid"
                                            onClick={markBuyer}
                                            disabled={buyerMarkExpired || deal?.buyer_id === conversation.other!.id}
                                        >
                                            Merkja sem kaupanda
                                        </TTButton>

                                        <TTButton
                                            type="button"
                                            size="sm"
                                            variant="red"
                                            look="solid"
                                            onClick={clearBuyer}
                                            disabled={buyerMarkExpired || !deal?.buyer_id}
                                        >
                                            Hætta við viðskipti
                                        </TTButton>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="card flex-grow-1 mb-3 d-flex flex-column">
                            <div
                                ref={scrollerRef}
                                className="card-body flex-grow-1 overflow-auto"
                                style={{ minHeight: 200 }}
                            >
                                {messages.data.map((m) => {
                                    const mine = m.sender_id === authUserId;
                                    const isSystem = m.message_type !== 'user';

                                    if (isSystem) {
                                        return (
                                            <div key={m.id} className="d-flex justify-content-center mb-3">
                                                <div className="text-muted small border rounded px-3 py-2 bg-white" style={{ maxWidth: 680 }}>
                                                    <div className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                                                    {m.created_at ? <div className="text-center">{fmtTime(m.created_at)}</div> : null}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={m.id} className={`d-flex mb-3 ${mine ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div style={{ maxWidth: 680 }} className={`p-2 rounded border ${mine ? 'bg-white' : 'bg-light'}`}>
                                                <div className="small text-muted mb-1">
                                                    {mine ? 'Þú' : (otherDisplayName || m.sender_name || 'Notandi')} · {fmtTime(m.created_at)}
                                                </div>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {messages.data.length === 0 ? (
                                    <div className="text-center text-muted py-5">Engin skilaboð í þessum þræði.</div>
                                ) : null}
                            </div>
                        </div>

                        {isChatBlocked ? (
                            <div className="alert alert-warning">Þessi þráður er blokkaður.</div>
                        ) : isChatClosed ? (
                            <div className="alert alert-warning">Samtal fyrir þessa auglýsingu hefur verið lokað.</div>
                        ) : (
                            <form onSubmit={send}>
                                <div className="card">
                                    <div className="card-body">
                                        <textarea
                                            className={`form-control ${errors.body ? 'is-invalid' : ''}`}
                                            rows={3}
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key !== 'Enter' || e.shiftKey) return;
                                                e.preventDefault();
                                                if (!processing) {
                                                    send();
                                                }
                                            }}
                                            placeholder="Skrifaðu skilaboð..."
                                        />
                                        {errors.body ? <div className="invalid-feedback">{errors.body}</div> : null}

                                        <div className="d-flex justify-content-end mt-2">
                                            <TTButton
                                                type="submit"
                                                variant="amber"
                                                look="solid"
                                                disabled={processing || !canSendMessage}
                                            >
                                                {processing ? 'Sendi...' : 'Senda'}
                                            </TTButton>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {showArchiveModal ? (
                <>
                    <div
                        className="modal fade show d-block"
                        aria-modal="true"
                        role="dialog"
                        tabIndex={-1}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Loka spjalli</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Loka"
                                        onClick={() => setShowArchiveModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    Þegar spjall er lokað getur hvorugur aðili sent skilaboð fyrr en opnað er aftur.
                                </div>
                                <div className="modal-footer">
                                    <TTButton
                                        type="button"
                                        variant="slate"
                                        look="ghost"
                                        onClick={() => setShowArchiveModal(false)}
                                    >
                                        Hætta við
                                    </TTButton>
                                    <TTButton
                                        type="button"
                                        variant="amber"
                                        look="solid"
                                        onClick={() => {
                                            router.patch(conversation.links.archive, {}, { preserveScroll: true });
                                            setShowArchiveModal(false);
                                        }}
                                    >
                                        Loka spjalli
                                    </TTButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" />
                </>
            ) : null}
        </AppLayout>
    );
}

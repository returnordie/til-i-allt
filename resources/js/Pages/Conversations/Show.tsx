import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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
        other: { id: number; name: string; username: string | null } | null;
        ad: { title: string; link: string } | null;
        is_archived: boolean;
        links: { archive: string; close: string; block: string; send: string };
    };
    messages: {
        data: Msg[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    deal: DealProps;
    flash?: { success?: string; error?: string };
};

function fmtTime(s: string | null) {
    if (!s) return '';
    return new Date(s).toLocaleString('is-IS');
}

export default function Show() {
    const { props } = usePage<PageProps>();
    const { conversation, messages, authUserId, deal } = props;

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
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-9 col-xl-8">
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                            <div>
                                <div className="h5 mb-0">{conversation.other?.name ?? 'Skilaboð'}</div>
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
                                    {conversation.is_archived ? 'Hætta að fela' : 'Fela'}
                                </TTButton>

                                <TTButton
                                    size="sm"
                                    variant="amber"
                                    look="solid"
                                    onClick={() => router.patch(conversation.links.close, { status: 'closed' }, { preserveScroll: true })}
                                    disabled={conversation.status !== 'open'}
                                >
                                    Til baka
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

                        <div className="card mb-3">
                            <div ref={scrollerRef} className="card-body" style={{ maxHeight: 520, overflow: 'auto' }}>
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
                                                    {mine ? 'Þú' : (m.sender_name ?? 'Notandi')} · {fmtTime(m.created_at)}
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

                        {conversation.status !== 'open' ? (
                            <div className="alert alert-warning">
                                Þessi þráður er {conversation.status === 'closed' ? 'lokaður' : 'blokkuður'}.
                            </div>
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
                                                disabled={processing}
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
                                    <h5 className="modal-title">Fela skilaboð</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Loka"
                                        onClick={() => setShowArchiveModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    Þegar auglýsing hefur verið falin getur viðmælandi ekki haldið áfram að senda skilaboð.
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
                                        Fela
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

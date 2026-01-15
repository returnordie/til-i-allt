import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef } from 'react';

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

function dealStatusLabel(status?: DealProps['status']) {
    switch (status) {
        case 'active':
            return 'Virk';
        case 'inactive':
            return 'Óvirk';
        case 'completed':
            return 'Frágengin';
        default:
            return status ?? 'Virk';
    }
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

    const send = (e: React.FormEvent) => {
        e.preventDefault();
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
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
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
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => router.patch(conversation.links.archive, {}, { preserveScroll: true })}
                                >
                                    {conversation.is_archived ? 'Taka úr geymslu' : 'Geyma'}
                                </button>

                                <button
                                    className="btn btn-outline-dark btn-sm"
                                    onClick={() => router.patch(conversation.links.close, { status: 'closed' }, { preserveScroll: true })}
                                    disabled={conversation.status !== 'open'}
                                >
                                    Loka
                                </button>

                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => router.patch(conversation.links.block, { status: 'blocked' }, { preserveScroll: true })}
                                    disabled={conversation.status === 'blocked'}
                                >
                                    Blokka
                                </button>
                            </div>
                        </div>

                        {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        {/* DEAL box (merkja kaupanda) */}
                        {canShowDealBox ? (
                            <div className="card mb-3">
                                <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-2">
                                    <div>
                                        <div className="fw-semibold">Viðskipti</div>
                                        <div className="small text-muted">
                                            Staða: <span className="fw-semibold">{dealStatusLabel(deal?.status)}</span>
                                            {deal?.buyer_id ? (
                                                <>
                                                    {' '}· Kaupandi ID: <span className="fw-semibold">{deal.buyer_id}</span>
                                                </>
                                            ) : (
                                                <> · <span className="text-muted">Enginn kaupandi valinn</span></>
                                            )}
                                        </div>
                                    </div>

                                    {canMarkBuyer ? (
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-sm"
                                                onClick={markBuyer}
                                                disabled={deal?.buyer_id === conversation.other!.id}
                                            >
                                                Merkja {conversation.other?.name ?? 'kaupanda'}
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={clearBuyer}
                                                disabled={!deal?.buyer_id}
                                            >
                                                Taka af kaupanda
                                            </button>
                                        </div>
                                    ) : null}
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
                                        <label className="form-label">Senda skilaboð</label>
                                        <textarea
                                            className={`form-control ${errors.body ? 'is-invalid' : ''}`}
                                            rows={3}
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            placeholder="Skrifaðu skilaboð..."
                                        />
                                        {errors.body ? <div className="invalid-feedback">{errors.body}</div> : null}

                                        <div className="d-flex justify-content-end mt-2">
                                            <button className="btn btn-dark" type="submit" disabled={processing}>
                                                {processing ? 'Sendi...' : 'Senda'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

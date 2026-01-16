import AppLayout from '@/Layouts/AppLayout';
import { StarRatingDisplay } from '@/Components/Reviews/StarRating';
import TTButton from '@/Components/UI/TTButton';
import ReviewModal, { ReviewPayload } from '@/Pages/Account/Deals/ReviewModal';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type DealRow = {
    id: number;
    status: 'active' | 'inactive' | 'completed' | string;
    confirmed_at: string | null;
    completed_at: string | null;
    canceled_at: string | null;
    price_final: number | null;
    currency: string;
    seller: { id: number; name: string } | null;
    buyer: { id: number; name: string } | null;
    is_seller: boolean;
    ad: { title: string; link: string; main_image_url: string | null } | null;
    can_respond: boolean;
    can_cancel: boolean;
    links: {
        set_status: string;
    };
    review: {
        can_review: boolean;
        has_review: boolean;
        is_open: boolean;
        received_rating: number | null;
        link: string;
    };
};

type PageProps = {
    deals: {
        data: DealRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    flash?: { success?: string; error?: string };
};

function statusMeta(status: DealRow['status']) {
    switch (status) {
        case 'active':
            return { label: 'Bíður staðfestingar', badge: 'text-bg-warning' };
        case 'completed':
            return { label: 'Lokið', badge: 'text-bg-success' };
        case 'inactive':
            return { label: 'Hætt við', badge: 'text-bg-secondary' };
        default:
            return { label: status, badge: 'text-bg-secondary' };
    }
}

function fmtDate(s: string | null) {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('is-IS');
}

function renderStarRating(rating: number) {
    return <StarRatingDisplay rating={rating} sizeClass="fs-6" />;
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { deals } = props;
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewModalLoading, setReviewModalLoading] = useState(false);
    const [reviewModalError, setReviewModalError] = useState<string | null>(null);
    const [reviewPayload, setReviewPayload] = useState<ReviewPayload | null>(null);

    const accept = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'completed' }, { preserveScroll: true });
    };

    const decline = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'inactive' }, { preserveScroll: true });
    };

    const cancel = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'inactive' }, { preserveScroll: true });
    };

    const openReviewModal = async (deal: DealRow) => {
        setReviewModalOpen(true);
        setReviewModalLoading(true);
        setReviewModalError(null);
        setReviewPayload(null);

        try {
            const response = await fetch(deal.review.link, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Tókst ekki að sækja umsögn.');
            }

            const payload = (await response.json()) as ReviewPayload;
            setReviewPayload(payload);
        } catch (error) {
            setReviewModalError(error instanceof Error ? error.message : 'Tókst ekki að sækja umsögn.');
        } finally {
            setReviewModalLoading(false);
        }
    };

    const closeReviewModal = () => {
        setReviewModalOpen(false);
        setReviewModalError(null);
        setReviewPayload(null);
    };

    const handleReviewSubmitted = () => {
        closeReviewModal();
        router.reload({ preserveScroll: true });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Mín viðskipti" />

            <div className="container py-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h1 className="h4 mb-0">Mín viðskipti</h1>
                </div>

                {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                <div className="card">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Auglýsing</th>
                                    <th>Aðili</th>
                                    <th>Staða</th>
                                    <th>Dagsetning</th>
                                    <th>Stjörnugjöf</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            Engin viðskipti fundust.
                                        </td>
                                    </tr>
                                ) : (
                                    deals.data.map((deal) => {
                                        const sm = statusMeta(deal.status);
                                        return (
                                            <tr key={deal.id}>
                                                <td>
                                                    <div className="d-flex gap-3">
                                                        <div style={{ width: 52, height: 52 }} className="border bg-white overflow-hidden">
                                                            {deal.ad?.main_image_url ? (
                                                                <img
                                                                    src={deal.ad.main_image_url}
                                                                    alt=""
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : null}
                                                        </div>
                                                        <div>
                                                            {deal.ad ? (
                                                                <a href={deal.ad.link} className="fw-semibold">
                                                                    {deal.ad.title}
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                            <div className="text-muted small">
                                                                Verð: {deal.price_final !== null ? `${deal.price_final.toLocaleString()} ${deal.currency}` : '—'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{deal.is_seller ? deal.buyer?.name ?? '—' : deal.seller?.name ?? '—'}</td>
                                                <td>
                                                    <span className={`badge ${sm.badge}`}>{sm.label}</span>
                                                </td>
                                                <td className="text-muted small">
                                                    {deal.completed_at ? `Lokið: ${fmtDate(deal.completed_at)}` : null}
                                                    {!deal.completed_at && deal.canceled_at ? `Hætt við: ${fmtDate(deal.canceled_at)}` : null}
                                                    {!deal.completed_at && !deal.canceled_at ? `Merkt: ${fmtDate(deal.confirmed_at)}` : null}
                                                </td>
                                                <td className="text-muted small">
                                                    {deal.review.received_rating !== null ? (
                                                        renderStarRating(deal.review.received_rating)
                                                    ) : (
                                                        <span className="text-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="text-end">
                                                    {deal.can_respond ? (
                                                        <div className="d-inline-flex gap-2" role="group">
                                                            <TTButton
                                                                type="button"
                                                                size="sm"
                                                                variant="green"
                                                                look="solid"
                                                                onClick={() => accept(deal)}
                                                            >
                                                                Samþykkja
                                                            </TTButton>
                                                            <TTButton
                                                                type="button"
                                                                size="sm"
                                                                variant="red"
                                                                look="solid"
                                                                onClick={() => decline(deal)}
                                                            >
                                                                Hafna
                                                            </TTButton>
                                                        </div>
                                                    ) : deal.can_cancel ? (
                                                        <TTButton
                                                            type="button"
                                                            size="sm"
                                                            variant="red"
                                                            look="solid"
                                                            onClick={() => cancel(deal)}
                                                        >
                                                            Hætta við
                                                        </TTButton>
                                                    ) : deal.review?.can_review ? (
                                                        <TTButton
                                                            type="button"
                                                            size="sm"
                                                            variant="amber"
                                                            look="solid"
                                                            onClick={() => openReviewModal(deal)}
                                                        >
                                                            Gefa umsögn
                                                        </TTButton>
                                                    ) : deal.review?.has_review ? (
                                                        <TTButton
                                                            type="button"
                                                            size="sm"
                                                            variant="amber"
                                                            look="solid"
                                                            onClick={() => openReviewModal(deal)}
                                                        >
                                                            Umsögn
                                                        </TTButton>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ReviewModal
                show={reviewModalOpen}
                payload={reviewPayload}
                loading={reviewModalLoading}
                error={reviewModalError}
                onClose={closeReviewModal}
                onSubmitted={handleReviewSubmitted}
            />
        </AppLayout>
    );
}

import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { Head, Link, router, usePage } from '@inertiajs/react';

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
    ad: { title: string; link: string } | null;
    can_respond: boolean;
    can_cancel: boolean;
    links: {
        set_status: string;
    };
    review: {
        can_review: boolean;
        has_review: boolean;
        is_open: boolean;
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

export default function Index() {
    const { props } = usePage<PageProps>();
    const { deals } = props;

    const accept = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'completed' }, { preserveScroll: true });
    };

    const decline = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'inactive' }, { preserveScroll: true });
    };

    const cancel = (deal: DealRow) => {
        router.patch(deal.links.set_status, { status: 'inactive' }, { preserveScroll: true });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Mín viðskipti" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
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
                                            <th className="text-end">Aðgerðir</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deals.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-4">
                                                    Engin viðskipti fundust.
                                                </td>
                                            </tr>
                                        ) : (
                                            deals.data.map((deal) => {
                                                const sm = statusMeta(deal.status);
                                                return (
                                                    <tr key={deal.id}>
                                                        <td>
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
                                                        <td className="text-end">
                                                            {deal.can_respond ? (
                                                                <div className="btn-group btn-group-sm" role="group">
                                                                    <button type="button" className="btn btn-success" onClick={() => accept(deal)}>
                                                                        Samþykkja
                                                                    </button>
                                                                    <button type="button" className="btn btn-danger" onClick={() => decline(deal)}>
                                                                        Hafna
                                                                    </button>
                                                                </div>
                                                            ) : deal.can_cancel ? (
                                                                <button type="button" className="btn btn-danger btn-sm" onClick={() => cancel(deal)}>
                                                                    Hætta við
                                                                </button>
                                                            ) : deal.review?.can_review ? (
                                                                <Link href={deal.review.link} className="btn btn-outline-warning btn-sm">
                                                                    Gefa umsögn
                                                                </Link>
                                                            ) : deal.review?.has_review ? (
                                                                <Link href={deal.review.link} className="btn btn-outline-secondary btn-sm">
                                                                    Skoða umsögn
                                                                </Link>
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
                </div>
            </div>
        </AppLayout>
    );
}

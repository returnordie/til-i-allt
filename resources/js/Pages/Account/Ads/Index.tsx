import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

type AdRow = {
    id: number;
    title: string;
    price: number | null;
    currency: string;
    section: string;

    status: 'active' | 'inactive' | 'sold';
    published_at: string | null;
    expires_at: string | null;
    views_count: number;

    category: { slug: string | null; name: string | null };
    main_image_url: string | null;
    buyer: { id: number; name: string } | null;
    sold_outside: boolean;
    can_extend: boolean;

    links: {
        edit: string;
        show: string;
        extend: string;
        status: string;
    };
};

type PageProps = {
    filters: { status: string; q: string };
    counts: Record<string, number>;
    extendOptions: number[];
    ads: {
        data: AdRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    flash?: { success?: string; error?: string };
};

function fmtDate(s: string | null) {
    if (!s) return '—';
    return new Date(s).toLocaleDateString();
}

function statusMeta(status: AdRow['status']) {
    switch (status) {
        case 'active':
            return { label: 'Virk', badge: 'text-bg-success' };
        case 'inactive':
            return { label: 'Óvirk', badge: 'text-bg-secondary' };
        case 'sold':
            return { label: 'Frágengin', badge: 'text-bg-dark' };
        default:
            return { label: status, badge: 'text-bg-secondary' };
    }
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { filters, counts, extendOptions, ads } = props;

    const setFilter = (status: string) => {
        router.get(route('account.ads.index'), { status, q: filters.q }, { preserveScroll: true, preserveState: true });
    };

    const patchStatus = (ad: AdRow, status: AdRow['status'] | 'active' | 'inactive' | 'sold') => {
        router.patch(ad.links.status, { status }, { preserveScroll: true });
    };

    const extend = (ad: AdRow, days: number) => {
        router.patch(ad.links.extend, { days }, { preserveScroll: true });
    };

    const filterButtons = [
        { key: 'all', label: 'Allt' },
        { key: 'active', label: 'Virkar' },
        { key: 'inactive', label: 'Óvirkar' },
        { key: 'sold', label: 'Frágengið' },
    ];

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Mínar auglýsingar" />

            <div className="container py-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h1 className="h4 mb-0">Mínar auglýsingar</h1>
                    <Link href={route('ads.create')} className="btn btn-warning btn-sm">
                        Ný auglýsing
                    </Link>
                </div>

                {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                <div className="card mb-3">
                    <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">
                            {filterButtons.map((b) => {
                                const active = filters.status === b.key || (filters.status === 'all' && b.key === 'all');
                                return (
                                    <button
                                        key={b.key}
                                        type="button"
                                        className={`btn btn-sm ${active ? 'btn-dark' : 'btn-outline-dark'}`}
                                        onClick={() => setFilter(b.key)}
                                    >
                                        {b.label}{' '}
                                        <span className={`ms-1 badge ${active ? 'text-bg-light' : 'text-bg-secondary'}`}>
                                            {counts[b.key] ?? 0}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile cards */}
                <div className="d-md-none">
                    {ads.data.map((ad) => {
                        const sm = statusMeta(ad.status);
                        return (
                            <div className="card mb-3" key={ad.id}>
                                <div className="card-body">
                                    <div className="d-flex gap-3">
                                        <div style={{ width: 84, height: 84 }} className="border rounded bg-white overflow-hidden">
                                            {ad.main_image_url ? (
                                                <img src={ad.main_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : null}
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between gap-2">
                                                <div className="fw-semibold">{ad.title}</div>
                                                <span className={`badge ${sm.badge}`}>{sm.label}</span>
                                            </div>

                                            <div className="text-muted small">
                                                {ad.price !== null ? `${ad.price.toLocaleString()} ${ad.currency}` : '—'} · Skoðanir: {ad.views_count}
                                            </div>

                                            <div className="text-muted small">
                                                Birting: {fmtDate(ad.published_at)} · Rennur út: {fmtDate(ad.expires_at)}
                                            </div>
                                            {ad.status === 'sold' ? (
                                                <div className="text-muted small">
                                                    Kaupandi: {ad.buyer?.name ?? (ad.sold_outside ? 'Selt utan vefsins' : 'Enginn')}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        <a className="btn btn-outline-dark btn-sm" href={ad.links.show}>
                                            Skoða
                                        </a>
                                        {ad.status !== 'sold' ? (
                                            <a className="btn btn-outline-secondary btn-sm" href={ad.links.edit}>
                                                Breyta
                                            </a>
                                        ) : null}

                                        {ad.status === 'active' ? (
                                            <button className="btn btn-outline-dark btn-sm" onClick={() => patchStatus(ad, 'inactive')}>
                                                Óvirkja
                                            </button>
                                        ) : null}

                                        {ad.status === 'inactive' ? (
                                            <button className="btn btn-dark btn-sm" onClick={() => patchStatus(ad, 'active')}>
                                                Virkja
                                            </button>
                                        ) : null}

                                        {ad.can_extend ? (
                                            <>
                                                {extendOptions.map((d) => (
                                                    <button key={d} className="btn btn-outline-secondary btn-sm" onClick={() => extend(ad, d)}>
                                                        +{d} dagar
                                                    </button>
                                                ))}
                                            </>
                                        ) : null}

                                        {ad.status !== 'sold' ? (
                                            <button className="btn btn-outline-dark btn-sm" onClick={() => patchStatus(ad, 'sold')}>
                                                Merkja selt
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop table */}
                <div className="card d-none d-md-block">
                    <div className="table-responsive">
                        <table className="table mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th>Auglýsing</th>
                                    <th>Staða</th>
                                    <th>Skoðanir</th>
                                    <th>Rennur út</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.data.map((ad) => {
                                    const sm = statusMeta(ad.status);

                                    return (
                                        <tr key={ad.id}>
                                            <td>
                                                <div className="d-flex gap-3">
                                                    <div style={{ width: 52, height: 52 }} className="border rounded bg-white overflow-hidden">
                                                        {ad.main_image_url ? (
                                                            <img src={ad.main_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : null}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{ad.title}</div>
                                                        <div className="text-muted small">
                                                            {ad.price !== null ? `${ad.price.toLocaleString()} ${ad.currency}` : '—'} ·{' '}
                                                            {ad.category?.name ?? ''}
                                                        </div>
                                                        {ad.status === 'sold' ? (
                                                            <div className="text-muted small">
                                                                Kaupandi: {ad.buyer?.name ?? (ad.sold_outside ? 'Selt utan vefsins' : 'Enginn')}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge ${sm.badge}`}>{sm.label}</span>
                                            </td>

                                            <td>{ad.views_count}</td>

                                            <td className="text-muted">{fmtDate(ad.expires_at)}</td>

                                            <td className="text-end">
                                                <div className="d-inline-flex flex-wrap gap-2 justify-content-end">
                                                    <a className="btn btn-outline-dark btn-sm" href={ad.links.show}>
                                                        Skoða
                                                    </a>
                                                    {ad.status !== 'sold' ? (
                                                        <a className="btn btn-outline-secondary btn-sm" href={ad.links.edit}>
                                                            Breyta
                                                        </a>
                                                    ) : null}

                                                    {ad.status === 'active' ? (
                                                        <button className="btn btn-outline-dark btn-sm" onClick={() => patchStatus(ad, 'inactive')}>
                                                            Óvirkja
                                                        </button>
                                                    ) : null}

                                                    {ad.status === 'inactive' ? (
                                                        <button className="btn btn-dark btn-sm" onClick={() => patchStatus(ad, 'active')}>
                                                            Virkja
                                                        </button>
                                                    ) : null}

                                                    {ad.can_extend ? (
                                                        extendOptions.map((d) => (
                                                            <button key={d} className="btn btn-outline-secondary btn-sm" onClick={() => extend(ad, d)}>
                                                                +{d} dagar
                                                            </button>
                                                        ))
                                                    ) : null}

                                                    {ad.status !== 'sold' ? (
                                                        <button className="btn btn-outline-dark btn-sm" onClick={() => patchStatus(ad, 'sold')}>
                                                            Selt
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {ads.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            Engar auglýsingar fundust.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {ads.links?.length ? (
                    <nav className="mt-3">
                        <ul className="pagination pagination-sm mb-0">
                            {ads.links.map((l, idx) => (
                                <li key={idx} className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}>
                                    {l.url ? (
                                        <Link className="page-link" href={l.url} preserveScroll>
                                            <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                        </Link>
                                    ) : (
                                        <span className="page-link">
                                            <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>
                ) : null}
            </div>
        </AppLayout>
    );
}

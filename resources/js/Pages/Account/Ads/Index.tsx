import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PropsWithChildren, RefObject, useEffect, useRef, useState } from 'react';

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

function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    initialFocus,
    dialogClassName,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    initialFocus?: RefObject<HTMLElement>;
    dialogClassName?: string;
    onClose: CallableFunction;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const modalSizeClass = {
        sm: 'modal-sm',
        md: '',
        lg: 'modal-lg',
        xl: 'modal-xl',
        '2xl': 'modal-xl',
    }[maxWidth];

    useEffect(() => {
        if (!show) return;

        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        };
    }, [show]);

    useEffect(() => {
        if (!show || !initialFocus?.current) return;
        requestAnimationFrame(() => initialFocus.current?.focus());
    }, [show, initialFocus]);

    useEffect(() => {
        if (!show || !closeable) return;

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [show, closeable]);

    if (!show) return null;

    return (
        <>
            <div
                id="modal"
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        close();
                    }
                }}
            >
                <div className={`modal-dialog modal-dialog-centered ${modalSizeClass} ${dialogClassName ?? ''}`.trim()}>
                    <div className="modal-content">{children}</div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
}

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
    const [soldAd, setSoldAd] = useState<AdRow | null>(null);
    const buyerIdentifierRef = useRef<HTMLInputElement>(null);
    const cancelSoldRef = useRef<HTMLButtonElement>(null);
    const {
        data: soldData,
        setData: setSoldData,
        patch: submitSold,
        processing: soldProcessing,
        reset: resetSold,
        clearErrors: clearSoldErrors,
        errors: soldErrors,
    } = useForm({
        status: 'sold',
        buyer_identifier: '',
        sold_outside: false,
    });

    const setFilter = (status: string) => {
        router.get(route('account.ads.index'), { status, q: filters.q }, { preserveScroll: true, preserveState: true });
    };

    const patchStatus = (ad: AdRow, status: AdRow['status'] | 'active' | 'inactive' | 'sold') => {
        router.patch(ad.links.status, { status }, { preserveScroll: true });
    };

    const extend = (ad: AdRow, days: number) => {
        router.patch(ad.links.extend, { days }, { preserveScroll: true });
    };

    const openSoldModal = (ad: AdRow) => {
        setSoldAd(ad);
        resetSold();
        clearSoldErrors();
    };

    const closeSoldModal = () => {
        setSoldAd(null);
        resetSold();
        clearSoldErrors();
    };

    useEffect(() => {
        if (!soldAd) return;

        requestAnimationFrame(() => {
            if (soldData.sold_outside) {
                cancelSoldRef.current?.focus();
                return;
            }

            buyerIdentifierRef.current?.focus();
        });
    }, [soldAd, soldData.sold_outside]);

    const confirmSold = () => {
        if (!soldAd) return;

        submitSold(soldAd.links.status, {
            preserveScroll: true,
            onSuccess: () => closeSoldModal(),
        });
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
                    <TTButton
                        as="link"
                        href={route('ads.create')}
                        size="sm"
                        variant="amber"
                        look="solid"
                    >
                        Ný auglýsing
                    </TTButton>
                </div>

                {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                <div className="card mb-3">
                    <div className="card-body">
                        <div className="d-flex flex-wrap gap-2">
                            {filterButtons.map((b) => {
                                const active = filters.status === b.key || (filters.status === 'all' && b.key === 'all');
                                return (
                                    <TTButton
                                        key={b.key}
                                        type="button"
                                        size="sm"
                                        variant="amber"
                                        look={active ? 'solid' : 'outline'}
                                        className={active ? undefined : 'text-dark'}
                                        onClick={() => setFilter(b.key)}
                                    >
                                        {b.label}{' '}
                                        <span className={`ms-1 badge ${active ? 'text-bg-dark' : 'text-bg-secondary'}`}>
                                            {counts[b.key] ?? 0}
                                        </span>
                                    </TTButton>
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
                                        <a
                                            href={ad.links.show}
                                            className="border rounded bg-white overflow-hidden d-inline-block"
                                            style={{ width: 84, height: 84 }}
                                        >
                                            {ad.main_image_url ? (
                                                <img
                                                    src={ad.main_image_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : null}
                                        </a>

                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between gap-2">
                                                <a className="fw-semibold text-decoration-none" href={ad.links.show}>
                                                    {ad.title}
                                                </a>
                                                <span className={`badge ${sm.badge}`}>{sm.label}</span>
                                            </div>

                                            <div className="text-muted small">
                                                {ad.price !== null ? `${ad.price.toLocaleString()} ${ad.currency}` : '—'} · Innlit: {ad.views_count}
                                            </div>

                                            <div className="text-muted small">
                                                Birting: {fmtDate(ad.published_at)} · Rennur út: {fmtDate(ad.expires_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {ad.status !== 'sold' ? (
                                            <TTButton as="link" href={ad.links.edit} size="sm" variant="amber" look="solid">
                                                Breyta
                                            </TTButton>
                                        ) : null}

                                        {ad.status === 'active' ? (
                                            <TTButton type="button" size="sm" variant="amber" look="solid" onClick={() => patchStatus(ad, 'inactive')}>
                                                Gera óvirkt
                                            </TTButton>
                                        ) : null}

                                        {ad.status === 'inactive' ? (
                                            <TTButton type="button" size="sm" variant="amber" look="solid" onClick={() => patchStatus(ad, 'active')}>
                                                Gera virkt
                                            </TTButton>
                                        ) : null}

                                        {ad.can_extend ? (
                                            <>
                                                {extendOptions.map((d) => (
                                                    <TTButton
                                                        key={d}
                                                        type="button"
                                                        size="sm"
                                                        variant="amber"
                                                        look="solid"
                                                        onClick={() => extend(ad, d)}
                                                    >
                                                        +{d} dagar
                                                    </TTButton>
                                                ))}
                                            </>
                                        ) : null}

                                        {ad.status !== 'sold' ? (
                                            <TTButton
                                                type="button"
                                                size="sm"
                                                variant="amber"
                                                look="solid"
                                                onClick={() => openSoldModal(ad)}
                                            >
                                                Merkja selt
                                            </TTButton>
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
                                    <th>Innlit</th>
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
                                                    <a
                                                        href={ad.links.show}
                                                        className="border rounded bg-white overflow-hidden d-inline-block"
                                                        style={{ width: 52, height: 52 }}
                                                    >
                                                        {ad.main_image_url ? (
                                                            <img
                                                                src={ad.main_image_url}
                                                                alt=""
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : null}
                                                    </a>
                                                    <div>
                                                        <a className="fw-semibold text-decoration-none" href={ad.links.show}>
                                                            {ad.title}
                                                        </a>
                                                        <div className="text-muted small">
                                                            {ad.price !== null ? `${ad.price.toLocaleString()} ${ad.currency}` : '—'} ·{' '}
                                                            {ad.category?.name ?? ''}
                                                        </div>
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
                                                    {ad.status !== 'sold' ? (
                                                        <TTButton as="link" href={ad.links.edit} size="sm" variant="amber" look="solid">
                                                            Breyta
                                                        </TTButton>
                                                    ) : null}

                                                    {ad.status === 'active' ? (
                                                        <TTButton type="button" size="sm" variant="amber" look="solid" onClick={() => patchStatus(ad, 'inactive')}>
                                                            Gera óvirkt
                                                        </TTButton>
                                                    ) : null}

                                                    {ad.status === 'inactive' ? (
                                                        <TTButton type="button" size="sm" variant="amber" look="solid" onClick={() => patchStatus(ad, 'active')}>
                                                            Gera virkt
                                                        </TTButton>
                                                    ) : null}

                                                    {ad.can_extend ? (
                                                        extendOptions.map((d) => (
                                                            <TTButton
                                                                key={d}
                                                                type="button"
                                                                size="sm"
                                                                variant="amber"
                                                                look="solid"
                                                                onClick={() => extend(ad, d)}
                                                            >
                                                                +{d} dagar
                                                            </TTButton>
                                                        ))
                                                    ) : null}

                                                    {ad.status !== 'sold' ? (
                                                        <TTButton
                                                            type="button"
                                                            size="sm"
                                                            variant="amber"
                                                            look="solid"
                                                            onClick={() => openSoldModal(ad)}
                                                        >
                                                            Merkja selt
                                                        </TTButton>
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
                        <ul className="pagination pagination-sm mb-0 tt-pagination-slate">
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

                <Modal
                    show={Boolean(soldAd)}
                    onClose={closeSoldModal}
                    maxWidth="md"
                    dialogClassName="tt-review-modal"
                    initialFocus={soldData.sold_outside ? cancelSoldRef : buyerIdentifierRef}
                >
                    <div className="p-4">
                        <h2 className="h5 mb-3">Merkja kaupenda</h2>
                        <p className="text-muted small mb-3">
                            Sláðu inn notandanafn kaupanda eða hakaðu við ef salan fór fram utan vefsins.
                        </p>
                        <div className="mb-3">
                            <label className="form-label fw-semibold" htmlFor="buyer-identifier">
                                Kaupandi (notandanafn)
                            </label>
                            <input
                                id="buyer-identifier"
                                className="form-control"
                                value={soldData.buyer_identifier}
                                onChange={(event) => setSoldData('buyer_identifier', event.target.value)}
                                disabled={soldData.sold_outside}
                                ref={buyerIdentifierRef}
                            />
                            {soldErrors.buyer_identifier ? (
                                <div className="text-danger small mt-2">{soldErrors.buyer_identifier}</div>
                            ) : null}
                        </div>
                        <div className="form-check mb-3">
                            <input
                                id="sold-outside"
                                className="form-check-input"
                                type="checkbox"
                                checked={soldData.sold_outside}
                                onChange={(event) => setSoldData('sold_outside', event.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="sold-outside">
                                Selt utan vefsins
                            </label>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <TTButton
                                type="button"
                                size="sm"
                                variant="amber"
                                look="solid"
                                onClick={closeSoldModal}
                                ref={cancelSoldRef}
                            >
                                Loka
                            </TTButton>
                            <TTButton
                                type="button"
                                size="sm"
                                variant="amber"
                                look="solid"
                                onClick={confirmSold}
                                disabled={soldProcessing}
                            >
                                Staðfesta
                            </TTButton>
                        </div>
                    </div>
                </Modal>
            </div>
        </AppLayout>
    );
}

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Link, router, usePage } from '@inertiajs/react';

type SectionKey = 'solutorg' | 'bilatorg' | 'fasteignir';

type AdImage = {
    id: number;
    public_id: string;
    url: string;
    is_main: boolean;
};

type AttributeItem = {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multiselect';
    group?: string | null;
    unit?: string | null;
    options?: { value: string; label: string }[] | null;
    value: any;
};

type AdShowProps = {
    ad: {
        id: number;
        title: string;
        price: number | null;
        description: string | null;
        section: SectionKey;
        slug: string;
        listing_type?: 'sell' | 'want' | null;
        views_count?: number;
        category: { name: string | null; slug: string | null };
        images: AdImage[];
        seller: {
            id: number;
            display: string;
            phone: string | null;
            address?: string | null;
            postcode?: {
                id: number;
                code: string;
                name: string | null;
                region?: { id: number; name: string } | null;
            } | null;
            rating?: { avg: number; count: number };
            links?: { profile: string };
        };
        attributes?: AttributeItem[];
    };
};

type SharedProps = {
    auth?: { user?: null | { id: number; name: string; username?: string | null } };
};

function sectionLabel(s: SectionKey) {
    if (s === 'solutorg') return 'Sölutorg';
    if (s === 'bilatorg') return 'Bílatorg';
    return 'Fasteignir';
}

function formatISK(value: number | null) {
    if (value === null || value === undefined) return 'Tilboð';
    try {
        return new Intl.NumberFormat('is-IS').format(value) + ' kr.';
    } catch {
        return `${value} kr.`;
    }
}

function listingTypeLabel(t?: 'sell' | 'want' | null) {
    if (!t) return null;
    return t === 'sell' ? 'Til sölu' : 'Óskast';
}

function Stars({ avg }: { avg: number }) {
    const full = Math.max(0, Math.min(5, Math.floor(avg)));
    const stars = Array.from({ length: 5 }, (_, i) => (i < full ? '★' : '☆')).join('');
    return <span className="fs-6" aria-label={`Einkunn ${avg} af 5`}>{stars}</span>;
}

function fmtNumber(n: any) {
    if (n === null || n === undefined || n === '') return null;
    const num = typeof n === 'number' ? n : Number(n);
    if (Number.isNaN(num)) return String(n);
    try {
        return new Intl.NumberFormat('is-IS').format(num);
    } catch {
        return String(num);
    }
}

function optionLabel(options: { value: string; label: string }[] | null | undefined, value: any) {
    if (!options) return null;
    const found = options.find((o) => String(o.value) === String(value));
    return found ? found.label : null;
}

export default function Show({ ad }: AdShowProps) {
    const page = usePage<SharedProps>();
    const authUserId = page.props.auth?.user?.id ?? null;
    const isOwner = authUserId !== null && authUserId === ad.seller.id;

    const images = useMemo(() => {
        const arr = Array.isArray(ad.images) ? [...ad.images] : [];
        arr.sort((a, b) => {
            const main = Number(b.is_main) - Number(a.is_main);
            if (main !== 0) return main;
            return a.id - b.id;
        });
        return arr;
    }, [ad.images]);

    const [activePublicId, setActivePublicId] = useState<string | null>(images[0]?.public_id ?? null);

    useEffect(() => {
        setActivePublicId(images[0]?.public_id ?? null);
    }, [ad.id, images]);

    const activeImg = useMemo(() => {
        if (!activePublicId) return null;
        return images.find((i) => i.public_id === activePublicId) ?? images[0] ?? null;
    }, [images, activePublicId]);

    const backHref = ad.category?.slug ? route('ads.index', { section: ad.section, categorySlug: ad.category.slug }) : '/';
    const showTitle = ad.title?.trim() || 'Auglýsing';
    const locationParts = [
        ad.seller.postcode ? `${ad.seller.postcode.code}${ad.seller.postcode.name ? ` ${ad.seller.postcode.name}` : ''}` : null,
        ad.seller.address || null,
    ].filter(Boolean);
    const locationLabel = locationParts.join(' · ');

    const onDelete = () => {
        if (!confirm('Ertu viss um að þú viljir eyða þessari auglýsingu?')) return;
        router.delete(route('ads.destroy', ad.id));
    };

    const onReport = () => {
        if (!confirm('Tilkynna þessa auglýsingu?')) return;
        router.post(route('ads.report', ad.id));
    };

    const onShare = async () => {
        const url = window.location.href;

        try {
            // @ts-ignore
            if (navigator.share) {
                // @ts-ignore
                await navigator.share({ title: showTitle, url });
                return;
            }
        } catch {}

        try {
            await navigator.clipboard.writeText(url);
            alert('Hlekkur afritaður.');
        } catch {
            prompt('Afritaðu hlekkinn:', url);
        }
    };

    const attributes = ad.attributes ?? [];

    const groupedAttrs = useMemo(() => {
        if (!attributes.length) return [];

        const byGroup = new Map<string, AttributeItem[]>();
        for (const a of attributes) {
            const g = (a.group || 'Nánari upplýsingar').trim();
            if (!byGroup.has(g)) byGroup.set(g, []);
            byGroup.get(g)!.push(a);
        }

        return Array.from(byGroup.entries()).map(([group, items]) => ({
            group,
            items: items.sort((x, y) => (x.label || '').localeCompare(y.label || '')),
        }));
    }, [attributes]);

    const renderAttrValue = (a: AttributeItem) => {
        const unit = a.unit ? ` ${a.unit}` : '';

        if (a.type === 'boolean') return a.value ? 'Já' : 'Nei';

        if (a.type === 'number') {
            const v = fmtNumber(a.value);
            return v ? `${v}${unit}` : '—';
        }

        if (a.type === 'select') {
            const lbl = optionLabel(a.options ?? null, a.value);
            return lbl ?? (a.value ?? '—');
        }

        if (a.type === 'multiselect') {
            const arr = Array.isArray(a.value) ? a.value : [];
            if (!arr.length) return null;
            const labels = arr.map((v) => optionLabel(a.options ?? null, v) ?? String(v));
            return (
                <div className="d-flex flex-wrap gap-2">
                    {labels.map((t, i) => (
                        <span key={i} className="tt-chip sub">
                            {t}
                        </span>
                    ))}
                </div>
            );
        }

        if (a.value === null || a.value === undefined || a.value === '') return '—';
        return String(a.value);
    };

    return (
        <div className="container py-4">
            <div className="tt-hero p-4  p-3 p-md-4 rounded-4 mb-4">
                <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                    <div>
                        <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                            <Link href={backHref} className="text-decoration-none text-muted fw-semibold">
                                {sectionLabel(ad.section)}
                            </Link>

                            {ad.category?.name ? <span className="tt-chip sub">{ad.category.name}</span> : null}

                            {listingTypeLabel(ad.listing_type) ? <span className="tt-chip sub">{listingTypeLabel(ad.listing_type)}</span> : null}
                        </div>

                        <h1 className="h3 mb-1">{showTitle}</h1>
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                            <div className="tt-ad-price fs-4">{formatISK(ad.price)}</div>
                            <div className="text-muted small">#{ad.id} · {ad.slug}</div>
                            {ad.views_count !== undefined ? (
                                <div className="text-muted small">Innlit: {ad.views_count}</div>
                            ) : null}
                        </div>
                        {locationLabel ? (
                            <div className="text-muted small mt-1">{locationLabel}</div>
                        ) : null}
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <TTButton type="button" look="ghost" variant="slate" onClick={onShare}>
                            Deila
                        </TTButton>

                        {isOwner ? (
                            <>
                                <TTButton
                                    as="link"
                                    href={route('ads.edit', ad.id)}
                                    look="ghost"
                                    variant="slate"
                                >
                                    Breyta
                                </TTButton>
                                <TTButton type="button" look="outline" variant="red" onClick={onDelete}>
                                    Eyða
                                </TTButton>
                            </>
                        ) : (
                            <TTButton type="button" look="ghost" variant="slate" onClick={onReport}>
                                Tilkynna
                            </TTButton>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="tt-card p-3 p-md-4 rounded-4 mb-4">
                        <div className="mb-3">
                            {activeImg?.url ? (
                                <div className="ratio ratio-16x9 rounded-4 overflow-hidden bg-light">
                                    <img src={activeImg.url} alt={showTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                                </div>
                            ) : (
                                <div className="ratio ratio-16x9 rounded-4 overflow-hidden bg-light d-flex align-items-center justify-content-center">
                                    <div className="text-muted fw-semibold">Engar myndir</div>
                                </div>
                            )}
                        </div>

                        {images.length > 1 ? (
                            <div className="tt-catfade">
                                <div className="tt-catrow" style={{ gap: 10 }}>
                                    {images.map((img) => {
                                        const active = img.public_id === activePublicId;
                                        return (
                                            <button
                                                key={img.public_id}
                                                type="button"
                                                className={`p-0 border-0 bg-transparent ${active ? 'opacity-100' : 'opacity-75'}`}
                                                onClick={() => setActivePublicId(img.public_id)}
                                                title={active ? 'Valin mynd' : 'Velja mynd'}
                                                style={{ width: 92, height: 60, borderRadius: 12, overflow: 'hidden', outline: active ? '2px solid rgba(0,0,0,.35)' : 'none' }}
                                            >
                                                <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="tt-card p-3 p-md-4 rounded-4 mb-4">
                        <h2 className="h5 mb-3">Lýsing</h2>

                        {ad.description ? <div style={{ whiteSpace: 'pre-wrap' }}>{ad.description}</div> : <div className="text-muted">Engin lýsing.</div>}
                    </div>

                    {groupedAttrs.length > 0 ? (
                        <div className="tt-card p-3 p-md-4 rounded-4">
                            <h2 className="h5 mb-3">Nánari upplýsingar</h2>

                            <div className="accordion" id="adAttrAcc">
                                {groupedAttrs.map(({ group, items }, idx) => {
                                    const collapseId = `adAttr_${idx}`;
                                    const open = idx === 0;

                                    return (
                                        <div className="accordion-item" key={group}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${open ? '' : 'collapsed'}`}
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#${collapseId}`}
                                                    aria-expanded={open ? 'true' : 'false'}
                                                    aria-controls={collapseId}
                                                >
                                                    {group}
                                                </button>
                                            </h2>

                                            <div id={collapseId} className={`accordion-collapse collapse ${open ? 'show' : ''}`} data-bs-parent="#adAttrAcc">
                                                <div className="accordion-body">
                                                    <div className="row g-3">
                                                        {items.map((a) => (
                                                            <div key={a.key} className={a.type === 'multiselect' ? 'col-12' : 'col-12 col-md-6'}>
                                                                <div className="text-muted small fw-semibold mb-1">{a.label}</div>
                                                                <div>{renderAttrValue(a)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="col-12 col-lg-4">
                    <div className="tt-card p-3 p-md-4 rounded-4 mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="fw-semibold">Seljandi</div>
                            <div className="text-muted small">ID: {ad.seller.id}</div>
                        </div>

                        <div className="fs-5 fw-bold mb-3">{ad.seller.display}</div>

                        {ad.seller.rating ? (
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Stars avg={ad.seller.rating.avg} />
                                <span className="text-muted small">
                                    {ad.seller.rating.avg.toFixed(1)} ({ad.seller.rating.count})
                                </span>
                            </div>
                        ) : null}

                        <div className="d-grid gap-2">
                            <TTButton
                                type="button"
                                variant="dark"
                                look="solid"
                                onClick={() => router.post(route('conversations.startForAd', ad.id))}
                            >
                                Senda skilaboð
                            </TTButton>

                            {ad.seller.links?.profile ? (
                                <TTButton
                                    as="link"
                                    href={ad.seller.links.profile}
                                    look="ghost"
                                    variant="slate"
                                >
                                    Skoða prófíl
                                </TTButton>
                            ) : null}

                            {ad.seller.phone ? (
                                <TTButton
                                    as="link"
                                    href={`tel:${ad.seller.phone}`}
                                    look="ghost"
                                    variant="slate"
                                >
                                    Hringja: {ad.seller.phone}
                                </TTButton>
                            ) : (
                                <TTButton type="button" look="ghost" variant="slate" disabled>
                                    Sími ekki sýnilegur
                                </TTButton>
                            )}
                        </div>

                        <hr className="my-4" />

                        <div className="d-flex flex-wrap gap-2">
                            <TTButton as="link" href={backHref} look="ghost" variant="slate">
                                ← Til baka
                            </TTButton>

                            <TTButton as="link" href={route('ads.create')} look="ghost" variant="slate">
                                Skrá nýja
                            </TTButton>
                        </div>
                    </div>

                    <div className="tt-card p-3 p-md-4 rounded-4">
                        <div className="text-muted small fw-semibold mb-2">Flokkur</div>
                        <div className="fw-semibold">
                            {sectionLabel(ad.section)}
                            {ad.category?.name ? ` · ${ad.category.name}` : ''}
                        </div>

                        <div className="text-muted small mt-3">Öryggi</div>
                        <div className="small text-muted">Ef eitthvað er grunsamlegt: notaðu “Tilkynna”.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout title="Auglýsing" container mainClassName="bg-light">
        {page}
    </AppLayout>
);

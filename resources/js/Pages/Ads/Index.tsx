import React, { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Hero from '@/Components/Hero';
import TTButton from '@/Components/UI/TTButton';
import { Link, router } from '@inertiajs/react';

type SectionKey = 'solutorg' | 'bilatorg' | 'fasteignir';

type Category = {
    name: string;
    slug: string;
    hero_art?: string | null;
};

type AdListItem = {
    id: number;
    title: string;
    price: number | null;
    slug: string;
    section: SectionKey;
    category: Category | null;
    main_image_url: string | null;
    show_url: string;
};

type PaginatorLink = { url: string | null; label: string; active: boolean };
type PaginatorMeta = { total: number; from: number | null; to: number | null };
type Paginator<T> = { data: T[]; links: PaginatorLink[]; meta: PaginatorMeta };

type Props = {
    section?: SectionKey;
    category?: Category | null;
    ads: Paginator<AdListItem>;
    filters?: { q?: string; sort?: 'newest' | 'price_asc' | 'price_desc'; min?: number | null; max?: number | null };
};

function sectionLabel(s?: SectionKey) {
    if (!s) return '';
    if (s === 'solutorg') return 'Sölutorg';
    if (s === 'bilatorg') return 'Bílatorg';
    return 'Fasteignir';
}

function formatISK(value: number | null) {
    if (value === null || value === undefined) return 'Verð á samkomulagi';
    try {
        return new Intl.NumberFormat('is-IS').format(value) + ' kr.';
    } catch {
        return `${value} kr.`;
    }
}

function decodeLabel(label: string) {
    return label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replaceAll('&amp;', '&')
        .replaceAll('&hellip;', '…');
}

function Pagination({ links }: { links: PaginatorLink[] }) {
    if (!links || links.length <= 3) return null;

    return (
        <nav aria-label="Síður" className="mt-4">
            <ul className="pagination justify-content-center flex-wrap gap-1 tt-pagination-slate">
                {links.map((l, i) => {
                    const text = decodeLabel(l.label);
                    const isDisabled = !l.url;
                    const cls = `page-item ${l.active ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;

                    return (
                        <li key={i} className={cls}>
                            {l.url ? (
                                <Link className="page-link" href={l.url} preserveScroll preserveState>
                                    {text}
                                </Link>
                            ) : (
                                <span className="page-link">{text}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default function Index({ section, category, ads, filters }: Props) {
    const isHome = !section && !category;
    const isCategory = !!category;

    const [q, setQ] = useState(filters?.q ?? '');
    const [sort, setSort] = useState<NonNullable<Props['filters']>['sort']>(filters?.sort ?? 'newest');
    const [min, setMin] = useState<string>(filters?.min ? String(filters.min) : '');
    const [max, setMax] = useState<string>(filters?.max ? String(filters.max) : '');

    const heroTitle = useMemo(() => {
        if (isHome) return 'Velkomin í Til í allt';
        return [sectionLabel(section), category?.name].filter(Boolean).join(' · ');
    }, [isHome, section, category]);

    const basePath = useMemo(() => {
        if (isHome) return `/`;
        if (section && category?.slug) return `/${section}/${category.slug}`;
        if (section) return `/${section}`;
        return `/`;
    }, [isHome, section, category?.slug]);

    const applyFilters = (e?: React.FormEvent) => {
        e?.preventDefault();

        router.get(
            basePath,
            {
                q: q.trim() || undefined,
                sort: sort || undefined,
                min: min ? Number(min) : undefined,
                max: max ? Number(max) : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true, only: ['ads', 'filters'] },
        );
    };

    const clearFilters = () => {
        setQ('');
        setSort('newest');
        setMin('');
        setMax('');
        router.get(basePath, {}, { preserveState: false, replace: true, only: ['ads', 'filters'] });
    };

    const artUrl = useMemo(() => {
        if (isHome) return '/i/hero/default.svg';
        if (category?.hero_art) return `/i/hero/${category.hero_art}.svg`;

        if (section === 'bilatorg') return '/i/hero/vehicle.svg';
        if (section === 'fasteignir') return '/i/hero/house.svg';
        if (section === 'solutorg') return '/i/hero/sofa.svg';

        return '/hero/default.svg';
    }, [isHome, category?.hero_art, section]);

    return (
        <div className="container py-4">
            <Hero
                context={isHome ? 'home' : category ? 'category' : 'section'}
                title={heroTitle}
                sectionLabel={sectionLabel(section)}
                categoryLabel={category?.name ?? undefined}
                meta={ads?.meta}
                showMeta={!isHome && !isCategory}
                hideKicker={isCategory}
                subtextOverride={isCategory ? '' : undefined}
                artUrl={artUrl}
            />

            <form onSubmit={applyFilters} className="tt-card p-3 p-md-4 mb-4">
                <div className="row g-2 g-md-3 align-items-end">
                    <div className="col-12 col-md-5">
                        <label className="form-label small text-muted mb-1">Leit</label>
                        <input
                            className="form-control tt-input"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="t.d. iPhone, Hilux, 3ja herbergja…"
                        />
                    </div>

                    <div className="col-6 col-md-3">
                        <label className="form-label small text-muted mb-1">Raða eftir</label>
                        <select className="form-select tt-input" value={sort} onChange={(e) => setSort(e.target.value as any)}>
                            <option value="newest">Nýjast</option>
                            <option value="price_asc">Lægsta verð</option>
                            <option value="price_desc">Hæsta verð</option>
                        </select>
                    </div>

                    <div className="col-6 col-md-2">
                        <label className="form-label small text-muted mb-1">Frá</label>
                        <input
                            className="form-control tt-input"
                            inputMode="numeric"
                            value={min}
                            onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="0"
                        />
                    </div>

                    <div className="col-6 col-md-2">
                        <label className="form-label small text-muted mb-1">Til</label>
                        <input
                            className="form-control tt-input"
                            inputMode="numeric"
                            value={max}
                            onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ''))}
                            placeholder="999999"
                        />
                    </div>

                    <div className="col-12 d-flex gap-2 mt-2">
                        <TTButton type="submit" variant="amber" look="solid">
                            Sía
                        </TTButton>
                        <TTButton type="button" variant="slate" look="ghost" onClick={clearFilters}>
                            Hreinsa
                        </TTButton>
                    </div>
                </div>
            </form>

            {ads.data.length === 0 ? (
                <div className="tt-card p-5 text-center">
                    <div className="display-6 mb-2">Engar auglýsingar ennþá</div>
                    <div className="text-muted mb-4">Prófaðu að breyta síum eða settu inn fyrstu auglýsinguna.</div>
                    <TTButton as="link" href="/ads/create" variant="amber" look="solid">
                        Setja inn auglýsingu
                    </TTButton>
                </div>
            ) : (
                <>
                    <div className="row g-3 g-md-4">
                        {ads.data.map((ad) => (
                            <div key={ad.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                                <div className="card h-100">
                                    <div className="bg-white border-bottom position-relative" style={{ aspectRatio: '16 / 10' }}>
                                        <Link href={ad.show_url} className="d-block h-100">
                                            {ad.main_image_url ? (
                                                <img
                                                    src={ad.main_image_url}
                                                    alt={ad.title}
                                                    loading="lazy"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                                    <span className="material-symbols-rounded tt-msym fs-1" aria-hidden="true">
                                                        image_not_supported
                                                    </span>
                                                    <div className="small mt-1">Engin mynd</div>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="tt-ad-pill">{ad.category?.name ?? sectionLabel(ad.section)}</div>
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                            <Link href={ad.show_url} className="fw-semibold text-truncate text-decoration-none text-dark">
                                                {ad.title}
                                            </Link>
                                            <div className="fw-semibold text-nowrap">{formatISK(ad.price)}</div>
                                        </div>

                                        <div className="mt-auto pt-3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination links={ads.links} />
                </>
            )}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;

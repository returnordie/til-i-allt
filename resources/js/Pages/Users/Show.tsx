import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, Link, usePage } from '@inertiajs/react';

type Profile = {
    username: string;
    display_name: string;
    member_since: string | null;
    active_ads_count: number;
    rating: {
        avg: number;   // 0-5
        count: number; // fjöldi reviews
    };
};

type AdCard = {
    id: number;
    title: string;
    slug: string;
    price: number | null;
    currency: string;
    location_text: string | null;
    section: string;
    published_at: string | null;
    category: { slug: string | null; name: string | null };
    main_image_url: string | null;
    links: { show: string };
};

type PageProps = {
    profile: Profile;
    ads: {
        data: AdCard[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
};

function Stars({ avg }: { avg: number }) {
    const full = Math.max(0, Math.min(5, Math.floor(avg)));
    const stars = Array.from({ length: 5 }, (_, i) => (i < full ? '★' : '☆')).join('');
    return <span className="fs-5" aria-label={`Einkunn ${avg} af 5`}>{stars}</span>;
}

function fmtPrice(p: number | null, cur: string) {
    if (p === null) return '—';
    return `${p.toLocaleString()} ${cur}`;
}

function fmtDate(s: string | null) {
    if (!s) return '—';
    return new Date(s).toLocaleDateString();
}

export default function Show() {
    const { props } = usePage<PageProps>();
    const { profile, ads } = props;

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title={`${profile.display_name} (@${profile.username})`} />

            <div className="container py-4">
                {/* Header */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                            <div>
                                <div className="h4 mb-1">{profile.display_name}</div>
                                <div className="text-muted">@{profile.username}</div>

                                <div className="d-flex flex-wrap gap-3 mt-2 text-muted small">
                                    <div>
                                        <span className="fw-semibold text-body">Auglýsingar:</span>{' '}
                                        {profile.active_ads_count}
                                    </div>
                                    <div>
                                        <span className="fw-semibold text-body">Skráður:</span>{' '}
                                        {profile.member_since ?? '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="text-end">
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                    <Stars avg={profile.rating.avg} />
                                    <div className="text-muted">
                                        <div className="fw-semibold">{profile.rating.avg.toFixed(1)}</div>
                                        <div className="small">({profile.rating.count})</div>
                                    </div>
                                </div>
                                <div className="text-muted small mt-1">
                                    Stjörnur tengjast viðskiptum (deal reviews).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ads grid */}
                <div className="row g-3">
                    {ads.data.map((ad) => (
                        <div key={ad.id} className="col-12 col-sm-6 col-lg-4">
                            <div className="card h-100">
                                <div className="bg-white border-bottom" style={{ aspectRatio: '16 / 10' }}>
                                    {ad.main_image_url ? (
                                        <img
                                            src={ad.main_image_url}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                            Engin mynd
                                        </div>
                                    )}
                                </div>

                                <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between gap-2">
                                        <div className="fw-semibold text-truncate">{ad.title}</div>
                                        <span className="badge text-bg-light">{ad.section}</span>
                                    </div>

                                    <div className="text-muted small mt-1">
                                        {ad.category?.name ?? ''}{ad.location_text ? ` · ${ad.location_text}` : ''}
                                    </div>

                                    <div className="mt-2 fw-semibold">
                                        {fmtPrice(ad.price, ad.currency)}
                                    </div>

                                    <div className="text-muted small mt-1">
                                        Birt: {fmtDate(ad.published_at)}
                                    </div>

                                    <div className="mt-auto pt-3">
                                        <TTButton
                                            as="link"
                                            href={ad.links.show}
                                            look="outline"
                                            variant="dark"
                                            className="w-100"
                                        >
                                            Skoða auglýsingu
                                        </TTButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {ads.data.length === 0 ? (
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body text-center text-muted py-5">
                                    Engar virkar auglýsingar.
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Pagination */}
                {ads.links?.length ? (
                    <nav className="mt-4">
                        <ul className="pagination pagination-sm mb-0 flex-wrap tt-pagination-slate">
                            {ads.links.map((l, idx) => (
                                <li
                                    key={idx}
                                    className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}
                                >
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

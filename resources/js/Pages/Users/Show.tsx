import AppLayout from '@/Layouts/AppLayout';
import { StarRatingDisplay } from '@/Components/Reviews/StarRating';
import TTButton from '@/Components/UI/TTButton';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Profile = {
    username: string;
    display_name: string;
    member_since: string | null;
    active_ads_count: number;
    rating: {
        avg: number;   // 0-5
        count: number; // fjöldi reviews
    };
    recent_reviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        created_at: string | null;
        rater_name: string | null;
    }>;
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

function formatRatingValue(rating: number) {
    const rounded = Math.round(rating * 2) / 2;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

function ReviewModal({ show, onClose, reviews }: { show: boolean; onClose: () => void; reviews: Profile['recent_reviews'] }) {
    useEffect(() => {
        if (!show) return;

        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        };
    }, [show]);

    if (!show) return null;

    return (
        <>
            <div
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="h5 mb-0">Síðustu umsagnir</h2>
                            <button type="button" className="btn-close" aria-label="Loka" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            {reviews.length === 0 ? (
                                <div className="text-muted text-center py-4">Engar umsagnir ennþá.</div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border rounded p-3 tt-review-surface">
                                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                                                <div className="fw-semibold">{review.rater_name ?? 'Óþekktur'}</div>
                                                <div className="text-muted small">
                                                    {review.created_at ? new Date(review.created_at).toLocaleDateString('is-IS') : ''}
                                                </div>
                                            </div>
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <span className="fw-semibold">{formatRatingValue(review.rating)}</span>
                                                <StarRatingDisplay rating={review.rating} />
                                            </div>
                                            {review.comment ? (
                                                <div className="mt-2">{review.comment}</div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
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
    const [showReviews, setShowReviews] = useState(false);
    const displayRating = profile.rating.count > 0 ? profile.rating.avg : 5;

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title={`${profile.display_name} (@${profile.username})`} />

            <div className="container py-4">
                <div className="row g-3">
                    <div className="col-12 col-lg-8 order-2 order-lg-1">
                        {/* Ads grid */}
                        <div className="row g-3">
                            {ads.data.map((ad) => (
                                <div key={ad.id} className="col-12 col-sm-6 col-xl-4">
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

                    <div className="col-12 col-lg-4 order-1 order-lg-2">
                        {/* Header */}
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                                    <div>
                                        <div className="h4 mb-1">{profile.display_name}</div>
                                        <div className="text-muted small">@{profile.username}</div>
                                    </div>

                                    <div className="text-end">
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-decoration-none"
                                            onClick={() => setShowReviews(true)}
                                            aria-label="Skoða umsagnir"
                                        >
                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                <StarRatingDisplay rating={displayRating} />
                                                <div className="text-muted">
                                                    <div className="fw-semibold">{formatRatingValue(displayRating)}</div>
                                                    <div className="small">({profile.rating.count})</div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 border-top pt-3">
                                    <div className="d-flex flex-column gap-2 text-muted small">
                                        <div>
                                            Skráður: <span className="text-dark">{fmtDate(profile.member_since)}</span>
                                        </div>
                                        <div>
                                            Virkar auglýsingar: <span className="text-dark">{profile.active_ads_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ReviewModal show={showReviews} onClose={() => setShowReviews(false)} reviews={profile.recent_reviews} />
        </AppLayout>
    );
}

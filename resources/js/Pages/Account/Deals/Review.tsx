import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import TTButton from '@/Components/UI/TTButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ratingOptions = [1, 2, 3, 4, 5];

type DealInfo = {
    id: number;
    status: string;
    completed_at: string | null;
    review_opens_at: string | null;
    review_closes_at: string | null;
    ad: { title: string; link: string } | null;
};

type RateeInfo = {
    id: number;
    name: string;
    profile_url: string | null;
    role: string;
};

type ExistingReview = {
    rating: number;
    comment: string | null;
    created_at: string | null;
};

type OtherReview = ExistingReview & {
    rater_name: string | null;
};

type PageProps = {
    deal: DealInfo;
    ratee: RateeInfo | null;
    existingReview: ExistingReview | null;
    otherReview: OtherReview | null;
    canReview: boolean;
    storeUrl: string;
    flash?: { success?: string; error?: string };
};

function renderStars(count: number) {
    return '★'.repeat(count) || '—';
}

export default function Review() {
    const { props } = usePage<PageProps>();
    const { deal, ratee, existingReview, otherReview, canReview, storeUrl } = props;
    const showBothReviews = Boolean(existingReview && otherReview);
    const pageTitle = existingReview ? 'Umsögn' : 'Gefa umsögn';
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        rating: existingReview?.rating ?? 5,
        comment: existingReview?.comment ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(storeUrl, { preserveScroll: true });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title={pageTitle} />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="h4 mb-1">{pageTitle}</h1>
                                <div className="text-muted small">
                                    {deal.ad ? (
                                        <span className="fw-semibold">
                                            {ratee ? `${ratee.role} ${ratee.name} vegna ` : null}
                                            <Link href={deal.ad.link}>{deal.ad.title}</Link>
                                        </span>
                                    ) : (
                                        'Viðskipti'
                                    )}
                                </div>
                            </div>
                            <TTButton
                                as="link"
                                href={route('account.deals.index')}
                                size="sm"
                                variant="amber"
                                look="solid"
                            >
                                Til baka
                            </TTButton>
                        </div>

                        {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        <div className="card">
                            <div className="card-body">
                                {showBothReviews ? (
                                    <div className="mb-4">
                                        <div className="fw-semibold mb-2">Umsagnir frá báðum aðilum</div>
                                        <div className="row g-3">
                                            <div className="col-12 col-lg-6">
                                                <div className="border rounded p-3 h-100 bg-light">
                                                    <div className="fw-semibold">Þín umsögn</div>
                                                    <div className="mt-2">
                                                        <span className="me-2">Stjörnur:</span>
                                                        <span className="fw-semibold">
                                                            {existingReview?.rating} {renderStars(existingReview?.rating ?? 0)}
                                                        </span>
                                                    </div>
                                                    {existingReview?.comment ? (
                                                        <div className="mt-2">
                                                            <div className="text-muted small">Athugasemd</div>
                                                            <div>{existingReview.comment}</div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="col-12 col-lg-6">
                                                <div className="border rounded p-3 h-100 bg-light">
                                                    <div className="fw-semibold">
                                                        Umsögn frá {otherReview?.rater_name ?? 'viðskiptaaðila'}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="me-2">Stjörnur:</span>
                                                        <span className="fw-semibold">
                                                            {otherReview?.rating} {renderStars(otherReview?.rating ?? 0)}
                                                        </span>
                                                    </div>
                                                    {otherReview?.comment ? (
                                                        <div className="mt-2">
                                                            <div className="text-muted small">Athugasemd</div>
                                                            <div>{otherReview.comment}</div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : existingReview ? (
                                    <div className="alert alert-secondary">
                                        <div className="fw-semibold">Umsögn skráð</div>
                                        <div className="mt-2">
                                            <span className="me-2">Stjörnur:</span>
                                            <span className="fw-semibold">
                                                {existingReview.rating} {renderStars(existingReview.rating)}
                                            </span>
                                        </div>
                                        {existingReview.comment ? (
                                            <div className="mt-2">
                                                <div className="text-muted small">Athugasemd</div>
                                                <div>{existingReview.comment}</div>
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}

                                {canReview ? (
                                    <form onSubmit={submit} className="mt-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Stjörnur</label>
                                            <div
                                                className="d-flex align-items-center gap-2"
                                                onPointerLeave={() => {
                                                    setHoverRating(null);
                                                    setIsDragging(false);
                                                }}
                                                onPointerUp={() => setIsDragging(false)}
                                            >
                                                {ratingOptions.map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className="p-0 border-0 bg-transparent"
                                                        onClick={() => setData('rating', value)}
                                                        onMouseEnter={() => setHoverRating(value)}
                                                        onFocus={() => setHoverRating(value)}
                                                        onBlur={() => setHoverRating(null)}
                                                        onPointerDown={(event) => {
                                                            event.preventDefault();
                                                            setIsDragging(true);
                                                            setData('rating', value);
                                                        }}
                                                        onPointerEnter={() => {
                                                            if (isDragging) {
                                                                setData('rating', value);
                                                            }
                                                        }}
                                                        aria-label={`${value} stjörnur`}
                                                    >
                                                        <span
                                                            className={`fs-3 ${
                                                                (hoverRating ?? data.rating) >= value ? 'text-warning' : 'text-muted'
                                                            }`}
                                                            aria-hidden="true"
                                                        >
                                                            ★
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.rating ? <div className="text-danger small mt-2">{errors.rating}</div> : null}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold" htmlFor="comment">
                                                Hnitmiðuð og málefnaleg umsögn.
                                            </label>
                                            <textarea
                                                id="comment"
                                                className="form-control"
                                                rows={4}
                                                value={data.comment}
                                                onChange={(event) => setData('comment', event.target.value)}
                                                placeholder="Hvað gékk vel? (valfrjálst)"
                                            />
                                            {errors.comment ? <div className="text-danger small mt-2">{errors.comment}</div> : null}
                                        </div>

                                        <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                                            Vista umsögn
                                        </TTButton>
                                    </form>
                                ) : existingReview ? null : (
                                    <div className="alert alert-warning mb-0">
                                        Umsagnaglugginn er ekki opinn eða umsögn hefur þegar verið skráð.
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-muted small mt-3 mb-0">
                            Umsögnin þín birtist ekki fyrr en hinn aðilinn hefur einnig skilað inn umsögn. Hafi engin umsögn
                            borist innan 7 daga frá því að kaupin voru samþykkt, lokast fyrir innsendingu umsagna og sú umsögn
                            sem hefur borist verður þá birt.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const ratingOptions = [0, 1, 2, 3, 4, 5];

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
};

type ExistingReview = {
    rating: number;
    comment: string | null;
    created_at: string | null;
};

type PageProps = {
    deal: DealInfo;
    ratee: RateeInfo | null;
    existingReview: ExistingReview | null;
    canReview: boolean;
    storeUrl: string;
    flash?: { success?: string; error?: string };
};

function fmtDate(value: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString('is-IS');
}

function renderStars(count: number) {
    return '★'.repeat(count) || '—';
}

export default function Review() {
    const { props } = usePage<PageProps>();
    const { deal, ratee, existingReview, canReview, storeUrl } = props;

    const { data, setData, post, processing, errors } = useForm({
        rating: existingReview?.rating ?? 0,
        comment: existingReview?.comment ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(storeUrl, { preserveScroll: true });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Gefa umsögn" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <div>
                                <h1 className="h4 mb-1">Gefa umsögn</h1>
                                <div className="text-muted small">
                                    {deal.ad ? (
                                        <Link href={deal.ad.link} className="fw-semibold">
                                            {deal.ad.title}
                                        </Link>
                                    ) : (
                                        'Viðskipti'
                                    )}
                                </div>
                            </div>
                            <Link href={route('account.deals.index')} className="btn btn-outline-secondary btn-sm">
                                Til baka
                            </Link>
                        </div>

                        {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        <div className="card">
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="fw-semibold">Móttakandi</div>
                                    <div className="text-muted">
                                        {ratee?.profile_url ? (
                                            <Link href={ratee.profile_url}>{ratee.name}</Link>
                                        ) : (
                                            ratee?.name ?? '—'
                                        )}
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-12 col-md-4">
                                        <div className="text-muted small">Lokið</div>
                                        <div className="fw-semibold">{fmtDate(deal.completed_at)}</div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="text-muted small">Opnar</div>
                                        <div className="fw-semibold">{fmtDate(deal.review_opens_at)}</div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="text-muted small">Lokanir</div>
                                        <div className="fw-semibold">{fmtDate(deal.review_closes_at)}</div>
                                    </div>
                                </div>

                                {existingReview ? (
                                    <div className="alert alert-info">
                                        <div className="fw-semibold">Umsögn skráð</div>
                                        <div className="small text-muted">Skráð: {fmtDate(existingReview.created_at)}</div>
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
                                            <label className="form-label fw-semibold">Stjörnur (0-5)</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {ratingOptions.map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className={`btn btn-sm ${data.rating === value ? 'btn-warning' : 'btn-outline-warning'}`}
                                                        onClick={() => setData('rating', value)}
                                                    >
                                                        <span className="me-1">{value}</span>
                                                        <span aria-hidden="true">{renderStars(value)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.rating ? <div className="text-danger small mt-2">{errors.rating}</div> : null}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold" htmlFor="comment">
                                                Athugasemd (valfrjálst)
                                            </label>
                                            <textarea
                                                id="comment"
                                                className="form-control"
                                                rows={4}
                                                value={data.comment}
                                                onChange={(event) => setData('comment', event.target.value)}
                                            />
                                            {errors.comment ? <div className="text-danger small mt-2">{errors.comment}</div> : null}
                                        </div>

                                        <button type="submit" className="btn btn-warning" disabled={processing}>
                                            Vista umsögn
                                        </button>
                                    </form>
                                ) : existingReview ? null : (
                                    <div className="alert alert-warning mb-0">
                                        Umsagnaglugginn er ekki opinn eða umsögn hefur þegar verið skráð.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

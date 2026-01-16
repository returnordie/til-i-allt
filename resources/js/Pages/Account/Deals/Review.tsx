import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { StarRatingDisplay, StarRatingInput } from '@/Components/Reviews/StarRating';
import TTButton from '@/Components/UI/TTButton';
import type { FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

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

const formatRating = (rating: number) => {
    const rounded = Math.round(rating * 2) / 2;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
};

export default function Review() {
    const { props } = usePage<PageProps>();
    const { deal, ratee, existingReview, otherReview, canReview, storeUrl } = props;
    const showBothReviews = Boolean(existingReview && otherReview);
    const pageTitle = existingReview ? 'Umsögn' : 'Gefa umsögn';
    const { data, setData, post, processing, errors } = useForm({
        rating: existingReview?.rating ?? 5,
        comment: existingReview?.comment ?? '',
    });

    const submit = (event: FormEvent) => {
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
                                                <div className="border rounded p-3 h-100 tt-review-surface">
                                                    <div className="fw-semibold">Þín umsögn</div>
                                                    <div className="mt-2">
                                                        <span className="me-2">Stjörnur:</span>
                                                        <span className="fw-semibold">
                                                            {existingReview ? formatRating(existingReview.rating) : '—'}
                                                        </span>
                                                        <StarRatingDisplay rating={existingReview?.rating ?? 0} className="ms-2" />
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
                                                <div className="border rounded p-3 h-100 tt-review-surface">
                                                    <div className="fw-semibold">
                                                        Umsögn frá {otherReview?.rater_name ?? 'viðskiptaaðila'}
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="me-2">Stjörnur:</span>
                                                        <span className="fw-semibold">
                                                            {otherReview ? formatRating(otherReview.rating) : '—'}
                                                        </span>
                                                        <StarRatingDisplay rating={otherReview?.rating ?? 0} className="ms-2" />
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
                                    <div className="border rounded p-3 tt-review-surface">
                                        <div className="fw-semibold">Umsögn skráð</div>
                                        <div className="mt-2">
                                            <span className="me-2">Stjörnur:</span>
                                            <span className="fw-semibold">{formatRating(existingReview.rating)}</span>
                                            <StarRatingDisplay rating={existingReview.rating} className="ms-2" />
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
                                            <StarRatingInput value={Number(data.rating)} onChange={(value) => setData('rating', value)} />
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

import { StarRatingDisplay, StarRatingInput } from '@/Components/Reviews/StarRating';
import TTButton from '@/Components/UI/TTButton';
import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PropsWithChildren, useEffect } from 'react';

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

export type ReviewPayload = {
    deal: DealInfo;
    ratee: RateeInfo | null;
    existingReview: ExistingReview | null;
    otherReview: OtherReview | null;
    canReview: boolean;
    storeUrl: string;
};

const formatRating = (rating: number) => {
    const rounded = Math.round(rating * 2) / 2;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
};

function Modal({
    children,
    show = false,
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

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
                id="review-modal"
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        close();
                    }
                }}
            >
                <div className="modal-dialog modal-dialog-centered tt-review-modal">
                    <div className="modal-content">{children}</div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );
}

type ReviewModalProps = {
    show: boolean;
    payload: ReviewPayload | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onSubmitted: () => void;
};

export default function ReviewModal({ show, payload, loading, error, onClose, onSubmitted }: ReviewModalProps) {
    const showBothReviews = Boolean(payload?.existingReview && payload?.otherReview);
    const pageTitle = payload?.existingReview ? 'Umsögn' : 'Gefa umsögn';
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        rating: payload?.existingReview?.rating ?? 5,
        comment: payload?.existingReview?.comment ?? '',
    });

    useEffect(() => {
        if (!payload) return;
        reset();
        clearErrors();
        setData({
            rating: payload.existingReview?.rating ?? 5,
            comment: payload.existingReview?.comment ?? '',
        });
    }, [payload, reset, clearErrors, setData]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!payload) return;
        post(payload.storeUrl, {
            preserveScroll: true,
            onSuccess: () => onSubmitted(),
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="modal-header">
                <div>
                    <h2 className="h5 mb-1">{pageTitle}</h2>
                    <div className="text-muted small">
                        {payload?.deal.ad ? (
                            <span className="fw-semibold">
                                {payload.ratee ? `${payload.ratee.role} ${payload.ratee.name} vegna ` : null}
                                <Link href={payload.deal.ad.link}>{payload.deal.ad.title}</Link>
                            </span>
                        ) : (
                            'Viðskipti'
                        )}
                    </div>
                </div>
                <button type="button" className="btn-close" aria-label="Loka" onClick={onClose} />
            </div>
            <div className="modal-body">
                {loading ? (
                    <div className="py-4 text-center text-muted">Sæki umsögn...</div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : payload ? (
                    <>
                        {showBothReviews ? (
                            <div className="mb-4">
                                <div className="fw-semibold mb-2">Umsagnir frá báðum aðilum</div>
                                <div className="row g-3">
                                    <div className="col-12 col-lg-6">
                                        <div className="border rounded p-3 h-100 tt-review-surface">
                                            <div className="fw-semibold">Þín umsögn</div>
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <span className="me-1">Stjörnugjöf:</span>
                                                <span className="fw-semibold">
                                                    {payload.existingReview ? formatRating(payload.existingReview.rating) : '—'}
                                                </span>
                                                <StarRatingDisplay rating={payload.existingReview?.rating ?? 0} />
                                            </div>
                                            {payload.existingReview?.comment ? (
                                                <div className="mt-2">
                                                    <div>{payload.existingReview.comment}</div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="col-12 col-lg-6">
                                        <div className="border rounded p-3 h-100 tt-review-surface">
                                            <div className="fw-semibold">
                                                Umsögn frá {payload.otherReview?.rater_name ?? 'viðskiptaaðila'}
                                            </div>
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <span className="me-1">Stjörnugjöf:</span>
                                                <span className="fw-semibold">
                                                    {payload.otherReview ? formatRating(payload.otherReview.rating) : '—'}
                                                </span>
                                                <StarRatingDisplay rating={payload.otherReview?.rating ?? 0} />
                                            </div>
                                            {payload.otherReview?.comment ? (
                                                <div className="mt-2">
                                                    <div>{payload.otherReview.comment}</div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : payload.existingReview ? (
                            <div className="border rounded p-3 tt-review-surface mb-4">
                                <div className="fw-semibold">Umsögn skráð</div>
                                <div className="mt-2 d-flex align-items-center gap-2">
                                    <span className="me-1">Stjörnugjöf:</span>
                                    <span className="fw-semibold">{formatRating(payload.existingReview.rating)}</span>
                                    <StarRatingDisplay rating={payload.existingReview.rating} />
                                </div>
                                {payload.existingReview.comment ? (
                                    <div className="mt-2">
                                        <div>{payload.existingReview.comment}</div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {payload.canReview ? (
                            <form onSubmit={submit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Stjörnugjöf</label>
                                    <StarRatingInput
                                        value={Number(data.rating)}
                                        onChange={(value) => setData('rating', value)}
                                    />
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

                                <div className="d-flex justify-content-end">
                                    <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                                        Vista umsögn
                                    </TTButton>
                                </div>

                                <p className="text-muted small mt-3 mb-0">
                                    Umsögnin þín birtist ekki fyrr en hinn aðilinn hefur einnig skilað inn umsögn. Hafi engin
                                    umsögn borist innan 7 daga frá því að viðskiptin voru samþykkt, lokast fyrir innsendingu
                                    umsagna og sú umsögn sem hefur borist verður þá birt.
                                </p>
                            </form>
                        ) : payload.existingReview ? null : (
                            <div className="alert alert-warning mb-0">
                                Umsagnaglugginn er ekki opinn eða umsögn hefur þegar verið skráð.
                            </div>
                        )}
                    </>
                ) : null}
            </div>
            <div className="modal-footer">
                <TTButton type="button" variant="slate" look="ghost" onClick={onClose}>
                    Loka
                </TTButton>
            </div>
        </Modal>
    );
}

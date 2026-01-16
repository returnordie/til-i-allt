import type { PointerEvent } from 'react';
import { useMemo, useState } from 'react';

type StarRatingDisplayProps = {
    rating: number;
    sizeClass?: string;
    className?: string;
    label?: string;
};

type StarRatingInputProps = {
    value: number;
    onChange: (value: number) => void;
    sizeClass?: string;
    className?: string;
};

const clampRating = (rating: number) => Math.max(0, Math.min(5, rating));

const formatRatingLabel = (rating: number) => {
    const rounded = Math.round(rating * 2) / 2;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
};

const buildStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => Math.max(0, Math.min(1, rating - index)));

export function StarRatingDisplay({ rating, sizeClass = 'fs-5', className = '', label }: StarRatingDisplayProps) {
    const clamped = clampRating(rating);
    const stars = useMemo(() => buildStars(clamped), [clamped]);
    const ariaLabel = label ?? `Einkunn ${formatRatingLabel(clamped)} af 5`;

    return (
        <span className={`d-inline-flex align-items-center gap-1 ${className}`} aria-label={ariaLabel}>
            {stars.map((fill, index) => (
                <span key={index} className={`tt-star ${sizeClass}`} aria-hidden="true">
                    <span className="tt-star-fill" style={{ width: `${fill * 100}%` }} />
                </span>
            ))}
        </span>
    );
}

export function StarRatingInput({ value, onChange, sizeClass = 'fs-3', className = '' }: StarRatingInputProps) {
    const clamped = clampRating(value);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const displayRating = hoverRating ?? clamped;
    const stars = useMemo(() => buildStars(displayRating), [displayRating]);

    const getRatingFromEvent = (event: PointerEvent<HTMLButtonElement>, index: number) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const isHalf = event.clientX - rect.left < rect.width / 2;
        return Math.min(5, Math.max(0, index + (isHalf ? 0.5 : 1)));
    };

    return (
        <div
            className={`d-flex align-items-center gap-2 ${className}`}
            onPointerLeave={() => setHoverRating(null)}
        >
            {stars.map((fill, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={starValue}
                        type="button"
                        className="p-0 border-0 bg-transparent"
                        onPointerMove={(event) => setHoverRating(getRatingFromEvent(event, index))}
                        onFocus={() => setHoverRating(starValue)}
                        onBlur={() => setHoverRating(null)}
                        onClick={(event) => onChange(getRatingFromEvent(event, index))}
                        onKeyDown={(event) => {
                            if (event.key === 'ArrowLeft') {
                                event.preventDefault();
                                onChange(Math.max(0, clamped - 0.5));
                            }
                            if (event.key === 'ArrowRight') {
                                event.preventDefault();
                                onChange(Math.min(5, clamped + 0.5));
                            }
                        }}
                        aria-label={`${formatRatingLabel(starValue)} stjörnur`}
                    >
                        <span className={`tt-star ${sizeClass}`} aria-hidden="true">
                            <span className="tt-star-fill" style={{ width: `${fill * 100}%` }} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

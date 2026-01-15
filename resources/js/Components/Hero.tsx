// resources/js/Components/Hero.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

type AdsMeta = { total?: number; from?: number; to?: number };
type HeroContext = 'home' | 'section' | 'category';

type HeroVariant = {
    kicker: string;
    title: string;
    subtext: string;
    art?: string; // filename without extension
};

type HeroProps = {
    title: string;
    context: HeroContext;

    sectionLabel?: string;
    categoryLabel?: string;
    subcategoryLabel?: string;

    meta?: AdsMeta;

    /**
     * CTA
     * - undefined: keep default (/ads/create) to stay backwards compatible
     * - null: hide CTA entirely
     */
    ctaHref?: string | null;
    ctaLabel?: string;
    hideCta?: boolean;

    /**
     * Kicker
     * - hideKicker: force hide
     * - kickerOverride: force text
     */
    hideKicker?: boolean;

    // hero art
    artUrl?: string;

    // meta toggle ("x auglýsingar ...")
    showMeta?: boolean;

    // optional overrides
    kickerOverride?: string;
    subtextOverride?: string;

    // slot (AdForm steps/breadcrumbs etc.)
    children?: React.ReactNode;

    /**
     * Extra
     * - allow controlling h1 size per-page without changing global hero look
     */
    titleClassName?: string; // default "h3 mb-1"
};

function pluralizeAuglysinga(n: number) {
    return n === 1 ? 'auglýsing' : 'auglýsingar';
}

function makeKicker(p: HeroProps) {
    if (p.context === 'home') return 'Velkomin';
    if (p.context === 'section') return p.sectionLabel ?? 'Yfirlit';
    const parts = [p.sectionLabel, p.categoryLabel, p.subcategoryLabel].filter(Boolean);
    return parts.join(' · ');
}

function makeSubtext(p: HeroProps) {
    const total = p.meta?.total ?? 0;

    if (p.context === 'home') {
        if (p.showMeta && total > 0) {
            return `${total} ${pluralizeAuglysinga(total)} · ${p.meta?.from ?? 0}-${p.meta?.to ?? 0} birtar`;
        }
        return 'Nýjar auglýsingar bætast reglulega við — kíktu aftur fljótlega.';
    }

    if (total > 0) {
        return `${total} ${pluralizeAuglysinga(total)} · ${p.meta?.from ?? 0}-${p.meta?.to ?? 0} birtar`;
    }

    return 'Engar auglýsingar ennþá';
}

const HOME_VARIANTS: HeroVariant[] = [
    {
        kicker: 'Besti hrekkur ársins',
        title: 'Seldu stólinn hennar mömmu',
        subtext: 'eða hitt og...',
        art: 'default',
    },
    {
        kicker: 'Hvað kostar varan?',
        title: 'Svona 6-7 hundruð',
        subtext: 'En það kostar ekkert að auglýsa',
        art: 'default',
    },
    {
        kicker: 'Nýtt markaðstorg!',
        title: 'Hreinsaðu út geymsluna!',
        subtext: 'Það kostar ekki krónu!',
        art: 'default',
    },
];

function pickRandomVariant(exceptTitle?: string) {
    if (HOME_VARIANTS.length === 1) return HOME_VARIANTS[0];
    const pool = exceptTitle ? HOME_VARIANTS.filter((v) => v.title !== exceptTitle) : HOME_VARIANTS;
    return pool[Math.floor(Math.random() * pool.length)];
}

export default function Hero(props: HeroProps) {
    // ✅ Backwards compatible default CTA (only if not explicitly provided)
    const ctaHref = props.ctaHref === undefined ? '/ads/create' : props.ctaHref;
    const ctaLabel = props.ctaLabel ?? 'Setja inn auglýsingu';

    const [homeVariant, setHomeVariant] = useState<HeroVariant | null>(null);

    useEffect(() => {
        if (props.context !== 'home') {
            setHomeVariant(null);
            return;
        }
        setHomeVariant((prev) => pickRandomVariant(prev?.title));
    }, [props.context, props.title]);

    const finalKicker =
        props.kickerOverride ??
        (props.context === 'home' ? homeVariant?.kicker : null) ??
        makeKicker(props);

    const finalTitle = props.context === 'home' ? homeVariant?.title ?? props.title : props.title;

    const finalSubtext =
        props.subtextOverride ??
        (props.context === 'home' ? homeVariant?.subtext : null) ??
        makeSubtext(props);

    // ✅ /i/hero/... (not /hero)
    const finalArtUrl =
        props.artUrl ??
        (props.context === 'home' && homeVariant?.art ? `/i/hero/${homeVariant.art}.svg` : undefined);

    const style = useMemo(() => {
        if (!finalArtUrl) return undefined;
        return ({ ['--tt-hero-art' as any]: `url("${finalArtUrl}")` } as React.CSSProperties);
    }, [finalArtUrl]);

    const showKicker = !props.hideKicker && !!String(finalKicker ?? '').trim();
    const showCta = !props.hideCta && !!ctaHref; // null/"" => hidden

    const titleClassName = props.titleClassName ?? 'h3 mb-1';

    return (
        <div className="tt-hero p-3 p-md-4 rounded-4 mb-4" style={style}>
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div className="tt-hero-text">
                    {showKicker ? (
                        <div className="tt-hero-kicker text-muted fw-semibold small">{finalKicker}</div>
                    ) : null}

                    <h1 className={titleClassName}>{finalTitle}</h1>

                    {finalSubtext ? <div className="text-muted">{finalSubtext}</div> : null}

                    {props.children ? <div className="tt-hero-slot mt-3">{props.children}</div> : null}
                </div>

                {showCta ? (
                    <div className="d-flex gap-2">
                        <Link href={ctaHref as string} className="btn tt-btn-cta">
                            {ctaLabel}
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

type SectionKey = 'solutorg' | 'bilatorg' | 'fasteignir';

type NavChild = { name: string; slug: string; icon?: string | null };
type NavParent = { name: string; slug: string; icon?: string | null; children?: NavChild[] };

type SharedProps = {
    nav: { categories: Record<SectionKey, NavParent[]> };
};

type Props = {
    section: SectionKey;
    currentCategorySlug?: string | null;

    mode?: 'dock' | 'panel';
    dismissOnClick?: boolean;
};

function MsIcon({
                    icon,
                    className = '',
                }: {
    icon?: string | null;
    className?: string;
}) {
    const iconName = (icon ?? '').trim() || 'category';
    return (
        <span className={`material-symbols-rounded tt-msym ${className}`} aria-hidden="true">
      {iconName}
    </span>
    );
}

export default function CategorySidebar({
                                            section,
                                            currentCategorySlug = null,
                                            mode = 'dock',
                                            dismissOnClick = false,
                                        }: Props) {
    const { props } = usePage<SharedProps>();
    const parents = props.nav?.categories?.[section] ?? [];

    const isLeafSection = section === 'bilatorg' || section === 'fasteignir';


    const activeParentSlug = useMemo(() => {
        if (!currentCategorySlug) return null;

        const direct = parents.find((p) => p.slug === currentCategorySlug);
        if (direct) return direct.slug;

        const viaChild = parents.find((p) => (p.children ?? []).some((c) => c.slug === currentCategorySlug));
        return viaChild?.slug ?? null;
    }, [parents, currentCategorySlug]);

    const [openParent, setOpenParent] = useState<string | null>(activeParentSlug);

    useEffect(() => {
        setOpenParent(activeParentSlug);
    }, [activeParentSlug, section]);

    const leafTiles = useMemo(() => {
        const out: Array<{ name: string; slug: string; icon?: string | null }> = [];
        parents.forEach((p) => {
            const kids = p.children ?? [];
            if (kids.length) {
                kids.forEach((c) => out.push({ name: c.name, slug: c.slug, icon: c.icon ?? null }));
            } else {
                out.push({ name: p.name, slug: p.slug, icon: p.icon ?? null });
            }
        });
        return out;
    }, [parents]);

    const openObj = useMemo(() => {
        if (!openParent) return null;
        return parents.find((p) => p.slug === openParent) ?? null;
    }, [parents, openParent]);

    const view = useMemo<'leaf' | 'parents' | 'children'>(() => {
        if (isLeafSection) return 'leaf';
        if (openObj) return 'children';
        return 'parents';
    }, [isLeafSection, openObj]);

    const tileCls = `tt-tile ${mode === 'panel' ? 'tt-tile--panel' : ''}`;

    const TileLink = (p: {
        href: string;
        active?: boolean;
        icon?: string | null;
        label: string;
    }) => (
        <Link
            href={p.href}
            className={`${tileCls} ${p.active ? 'active' : ''}`}
            data-bs-dismiss={dismissOnClick ? 'offcanvas' : undefined}
            aria-current={p.active ? 'page' : undefined}
        >
            <MsIcon icon={p.icon} className="tt-tile-ico" />
            <span className="tt-tile-name">{p.label}</span>
        </Link>
    );

    const TileBtn = (p: {
        onClick: () => void;
        active?: boolean;
        icon?: string | null;
        label: string;
    }) => (
        <button
            type="button"
            className={`${tileCls} ${p.active ? 'active' : ''}`}
            onClick={p.onClick}
        >
            <MsIcon icon={p.icon} className="tt-tile-ico" />
            <span className="tt-tile-name">{p.label}</span>
        </button>
    );

    return (
        <div className={`tt-cnav ${mode === 'panel' ? 'tt-cnav--panel' : 'tt-cnav--dock'}`}>
            <div className="tt-grid">
                {view === 'leaf' ? (
                    leafTiles.map((t) => (
                        <TileLink
                            key={`leaf_${t.slug}`}
                            href={`/${section}/${t.slug}`}
                            active={currentCategorySlug === t.slug}
                            icon={t.icon ?? null}
                            label={t.name}
                        />
                    ))
                ) : view === 'parents' ? (
                    parents.map((p) => (
                        <TileBtn
                            key={`p_${p.slug}`}
                            onClick={() => setOpenParent(p.slug)}
                            active={activeParentSlug === p.slug}
                            icon={p.icon ?? null}
                            label={p.name}
                        />
                    ))
                ) : (
                    <>
                        <TileBtn
                            key="back"
                            onClick={() => setOpenParent(null)}
                            icon="arrow_back"
                            label="Til baka"
                        />

                        {openObj ? (
                            <TileLink
                                key={`all_${openObj.slug}`}
                                href={`/${section}/${openObj.slug}`}
                                active={currentCategorySlug === openObj.slug}
                                icon={openObj.icon ?? null}
                                label={`Allt í ${openObj.name}`}
                            />
                        ) : null}

                        {(openObj?.children ?? []).map((ch) => (
                            <TileLink
                                key={`ch_${ch.slug}`}
                                href={`/${section}/${ch.slug}`}
                                active={currentCategorySlug === ch.slug}
                                icon={ch.icon ?? null}
                                label={ch.name}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

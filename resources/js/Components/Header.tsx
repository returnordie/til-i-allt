import React, { useEffect, useMemo, useRef, useState } from 'react';
import TTButton from '@/Components/UI/TTButton';
import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import CategorySidebar from '@/Components/CategorySidebar';

type SectionKey = 'solutorg' | 'bilatorg' | 'fasteignir';

type RecentNotification = {
    id: string;
    read_at: string | null;
    created_at: string | null;
    title: string;
    body: string | null;
    open_link: string;
};

type SharedProps = {
    auth: {
        user: null | { id: number; name: string; username: string | null };
        unreadConversationsCount?: number;
        unreadNotificationsCount?: number;
        recentNotifications?: RecentNotification[];
    };
    nav: { categories: Record<SectionKey, any[]> };
};

type HeaderProps = {
    hideCatbar?: boolean;
    hideOffcanvasButtons?: boolean;
};

function sectionLabel(s: SectionKey) {
    if (s === 'solutorg') return 'Sölutorg';
    if (s === 'bilatorg') return 'Bílatorg';
    return 'Fasteignir';
}

function parseSectionFromUrl(url: string): SectionKey | null {
    const seg = (url || '').split('?')[0].split('/').filter(Boolean)[0] as string | undefined;
    if (seg === 'solutorg' || seg === 'bilatorg' || seg === 'fasteignir') return seg;
    return null;
}

function parseCategorySlugFromUrl(url: string, section: SectionKey | null): string | null {
    if (!section) return null;
    const segs = (url || '').split('?')[0].split('/').filter(Boolean);
    return segs[1] ?? null;
}

function pickDefaultCategorySlug(nav: Record<SectionKey, any[]>, section: SectionKey) {
    return nav?.[section]?.[0]?.slug ?? null;
}

const Ico = {
    cats: (
        <svg className="tt-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    search: (
        <svg className="tt-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    bell: (
        <svg className="tt-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    chat: (
        <svg className="tt-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
                d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    ),
    user: (
        <svg className="tt-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    gear: (
        <svg className="tt-ico sm" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
            <path
                d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.5-2.3.6a7.7 7.7 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a7.7 7.7 0 0 0-1.7 1l-2.3-.6-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 2l-2 1.2 2 3.5 2.3-.6a7.7 7.7 0 0 0 1.7 1l.3 2.4h4l.3-2.4a7.7 7.7 0 0 0 1.7-1l2.3.6 2-3.5-2-1.2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    ),
    list: (
        <svg className="tt-ico sm" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    ),
    logout: (
        <svg className="tt-ico sm" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M7 8l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

export default function Header({ hideCatbar = false, hideOffcanvasButtons = false }: HeaderProps) {
    const { props, url } = usePage<SharedProps>();
    const user = props.auth?.user ?? null;
    const nav = props.nav?.categories;

    const currentSection = useMemo(() => parseSectionFromUrl(url), [url]);
    const currentCategorySlug = useMemo(() => parseCategorySlugFromUrl(url, currentSection), [url, currentSection]);
    // Ekki “active” section á account síðum. Notum samt default fyrir leit.
    const resolvedSection: SectionKey = currentSection ?? 'solutorg';
    const [mobileSection, setMobileSection] = useState<SectionKey>(resolvedSection);

    useEffect(() => {
        setMobileSection(resolvedSection);
    }, [resolvedSection]);

    const unreadNotif = props.auth?.unreadNotificationsCount ?? 0;
    const unreadMsg = props.auth?.unreadConversationsCount ?? 0;
    const recent = props.auth?.recentNotifications ?? [];

    // Sýna flokka alls staðar nema þegar því er sérstaklega falið.
    const showDock = !hideCatbar;
    const showCatsButton = true;
    const showCatsPanel = showDock || showCatsButton;

    const sectionHref = (section: SectionKey) => {
        if (section === 'solutorg') return `/${section}`;
        const slug = pickDefaultCategorySlug(nav, section);
        return slug ? `/${section}/${slug}` : `/${section}`;
    };

    // Navbar search (ads search)
    const [q, setQ] = useState('');
    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;

        router.get(
            '/leit',
            { q: query, section: resolvedSection },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // (optional) refresh counts
    const reloadingRef = useRef(false);
    useEffect(() => {
        if (!user) return;

        const refresh = () => {
            if (reloadingRef.current) return;
            if (document.visibilityState !== 'visible') return;

            reloadingRef.current = true;
            router.reload({
                only: ['auth'],
                preserveScroll: true,
                preserveState: true,
                onFinish: () => (reloadingRef.current = false),
            });
        };

        const onVis = () => document.visibilityState === 'visible' && refresh();
        document.addEventListener('visibilitychange', onVis);

        const id = window.setInterval(refresh, 15000);
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [user?.id]);

    useEffect(() => {
        const ids = ['ttSearch', 'ttCats'];
        const cleanupBackdrop = () => {
            document.querySelectorAll('.offcanvas-backdrop').forEach((el) => el.remove());
            document.body.classList.remove('offcanvas-backdrop');
            document.body.style.removeProperty('overflow');
        };

        const listeners = ids
            .map((id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                const handler = () => cleanupBackdrop();
                el.addEventListener('hidden.bs.offcanvas', handler as EventListener);
                return { el, handler };
            })
            .filter(Boolean) as Array<{ el: HTMLElement; handler: EventListener }>;

        return () => {
            listeners.forEach(({ el, handler }) => el.removeEventListener('hidden.bs.offcanvas', handler));
        };
    }, []);

    const profileHref = user?.username ? route('users.show', user.username) : route('account.settings.edit');
    const profileLabel = user?.username ? 'Notendasíðan mín' : 'Búa til notendanafn';
    const markAllNotificationsRead = () => {
        if (unreadNotif === 0) return;
        router.patch(route('notifications.readAll'), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <header className="tt-header">
            {/* ✅ ONLY topbar sticky */}
            <div className="tt-topwrap">
                <div className="container">
                    <div className="tt-topbar d-flex align-items-center gap-3 py-2">
                        <Link href="/" className="tt-brand flex-shrink-0">
                            <div className="tt-mark">TÍ</div>
                            <div className="tt-brand-name d-none d-sm-block">
                                <div className="name">Til í allt</div>
                                <div className="tag">Smáauglýsingar</div>
                            </div>
                        </Link>

                        {/* Sections (desktop) */}
                        <nav className="tt-sections d-none d-lg-flex ms-2">
                            {(['solutorg', 'bilatorg', 'fasteignir'] as SectionKey[]).map((s) => (
                                <Link key={s} href={sectionHref(s)} className={`tt-sec ${currentSection === s ? 'active' : ''}`}>
                                    {sectionLabel(s)}
                                </Link>
                            ))}
                        </nav>

                        {/* ✅ Search in navbar (ads search), not categories */}
                        <form onSubmit={onSearch} className="tt-navsearch d-none d-md-flex flex-grow-1 ms-lg-3">
                            <span className="tt-navsearch-ico">{Ico.search}</span>
                            <input
                                className="form-control tt-navsearch-input"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Leita í auglýsingum…"
                                aria-label="Leita í auglýsingum"
                            />
                        </form>

                        <div className="ms-auto d-flex align-items-center gap-2">
                            {/* Mobile buttons */}
                            <>
                                {showCatsButton ? (
                                    <button
                                        type="button"
                                        className="tt-iconlink d-inline-flex"
                                        data-bs-toggle="offcanvas"
                                        data-bs-target="#ttCats"
                                        aria-controls="ttCats"
                                        title="Flokkar"
                                    >
                                        {Ico.cats}
                                    </button>
                                ) : null}

                                {!hideOffcanvasButtons ? (
                                    <button
                                        type="button"
                                        className="tt-iconlink d-inline-flex d-md-none"
                                        data-bs-toggle="offcanvas"
                                        data-bs-target="#ttSearch"
                                        aria-controls="ttSearch"
                                        title="Leit"
                                    >
                                        {Ico.search}
                                    </button>
                                ) : null}
                            </>

                            {!user ? (
                                <>
                                    <TTButton as="link" href={route('login')} look="ghost" variant="slate">
                                        Innskrá
                                    </TTButton>
                                    <TTButton
                                        as="link"
                                        href={route('register')}
                                        look="ghost"
                                        variant="slate"
                                        className="d-none d-sm-inline-flex"
                                    >
                                        Nýskrá
                                    </TTButton>
                                </>
                            ) : (
                                <>
                                    {/* Notifications */}
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="tt-iconlink position-relative"
                                                aria-expanded="false"
                                                aria-label="Tilkynningar"
                                                title="Tilkynningar"
                                                onClick={markAllNotificationsRead}
                                            >
                                                {Ico.bell}
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" menuClasses="tt-drop">
                                            <div className="tt-droplist">
                                                {recent.length === 0 ? (
                                                    <div className="tt-empt">Engar tilkynningar ennþá.</div>
                                                ) : (
                                                    recent.map((n) => (
                                                        <Link key={n.id} href={n.open_link} className={`tt-dropitem ${n.read_at ? '' : 'unread'}`}>
                                                            <div className="tt-dropitem-row">
                                                                <div className="tt-dropitem-title">{n.title}</div>
                                                                <div className="tt-dropitem-time">
                                                                    {n.created_at ? new Date(n.created_at).toLocaleDateString('is-IS') : ''}
                                                                </div>
                                                            </div>
                                                            {n.body ? <div className="tt-dropitem-body">{n.body}</div> : null}
                                                        </Link>
                                                    ))
                                                )}
                                            </div>

                                            <div className="tt-dropfoot">
                                                <TTButton
                                                    as="link"
                                                    href={route('notifications.inbox')}
                                                    look="ghost"
                                                    variant="slate"
                                                    className="w-100"
                                                >
                                                    Sjá allt
                                                </TTButton>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>

                                    {/* Messages */}
                                    <Link
                                        href={route('conversations.latest')}
                                        className="tt-iconlink position-relative"
                                        aria-label="Skilaboð"
                                        title="Skilaboð"
                                    >
                                        {Ico.chat}
                                        {unreadMsg > 0 ? <span className="tt-badge">{unreadMsg > 99 ? '99+' : unreadMsg}</span> : null}
                                    </Link>

                                    {/* User dropdown */}
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="tt-userbtn" type="button" aria-expanded="false">
                                                {Ico.user}
                                                <span className="d-none d-md-inline">{user.username ?? user.name}</span>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" menuClasses="tt-menu">
                                            <div>
                                                <Link className="dropdown-item tt-menuitem" href={profileHref}>
                                                    <span className="tt-mi">{Ico.user}</span>
                                                    {profileLabel}
                                                </Link>
                                                <Link className="dropdown-item tt-menuitem" href={route('account.settings.edit')}>
                                                    <span className="tt-mi">{Ico.gear}</span>
                                                    Stillingar
                                                </Link>
                                                <Link className="dropdown-item tt-menuitem" href={route('account.ads.index')}>
                                                    <span className="tt-mi">{Ico.list}</span>
                                                    Mínar auglýsingar
                                                </Link>
                                                <Link className="dropdown-item tt-menuitem" href={route('account.deals.index')}>
                                                    <span className="tt-mi">{Ico.list}</span>
                                                    Mín viðskipti
                                                </Link>
                                                <hr className="dropdown-divider" />
                                                <Link className="dropdown-item tt-menuitem text-danger" href={route('logout')} method="post" as="button">
                                                    <span className="tt-mi">{Ico.logout}</span>
                                                    Útskrá
                                                </Link>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Categories NOT sticky */}
            {showDock ? (
                <div className="tt-catdock d-none d-lg-block">
                    <div className="container">
                        <CategorySidebar
                            mode="dock"
                            section={resolvedSection}
                            currentCategorySlug={currentCategorySlug}
                        />
                    </div>
                </div>
            ) : null}

            {/* Mobile: categories offcanvas */}
            {showCatsPanel ? (
                <div className="offcanvas offcanvas-start tt-catscanvas" tabIndex={-1} id="ttCats" aria-labelledby="ttCatsLabel">
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="ttCatsLabel">
                            Flokkar
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
                    </div>
                    <div className="offcanvas-body">
                        <div className="tt-sections tt-sections--mini mb-3">
                            {(['solutorg', 'bilatorg', 'fasteignir'] as SectionKey[]).map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`tt-sec tt-sec--btn ${mobileSection === s ? 'active' : ''}`}
                                    onClick={() => setMobileSection(s)}
                                >
                                    {sectionLabel(s)}
                                </button>
                            ))}
                        </div>

                        <CategorySidebar
                            mode="panel"
                            section={mobileSection}
                            currentCategorySlug={currentCategorySlug}
                            dismissOnClick
                        />
                    </div>
                </div>
            ) : null}

            {/* Mobile: search offcanvas */}
            <div className="offcanvas offcanvas-top" tabIndex={-1} id="ttSearch" aria-labelledby="ttSearchLabel" style={{ height: 200 }}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="ttSearchLabel">
                        Leit í auglýsingum
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
                </div>
                <div className="offcanvas-body">
                    <form onSubmit={onSearch} className="tt-navsearch tt-navsearch--mobile w-100">
                        <span className="tt-navsearch-ico">{Ico.search}</span>
                        <input
                            className="form-control tt-navsearch-input"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Leita í auglýsingum…"
                            aria-label="Leita í auglýsingum"
                        />
                        <TTButton
                            type="submit"
                            variant="amber"
                            look="solid"
                            className="w-100 mt-3"
                            data-bs-dismiss="offcanvas"
                        >
                            Leita
                        </TTButton>
                    </form>
                </div>
            </div>
        </header>
    );
}

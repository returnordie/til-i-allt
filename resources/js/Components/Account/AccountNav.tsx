import { Link, usePage } from '@inertiajs/react';

type NavItem = {
    href: string;
    title: string;
    desc?: string;
    activeWhen: (url: string) => boolean;
};

export default function AccountNav() {
    const { url } = usePage();

    const items: NavItem[] = [
        {
            href: route('account.settings.edit'),
            title: 'Stillingar',
            desc: 'Upplýsingar og sjálfgefin atriði',
            activeWhen: (u) => u.startsWith('/mitt-svaedi/stillingar'),
        },
        {
            href: route('account.notifications.edit'),
            title: 'Tilkynningar',
            desc: 'Tölvupóststillingar',
            activeWhen: (u) => u.startsWith('/mitt-svaedi/tilkynningar'),
        },
        {
            href: route('account.security.edit'),
            title: 'Öryggi',
            desc: 'Breyta lykilorði',
            activeWhen: (u) => u.startsWith('/mitt-svaedi/oryggi'),
        },
    ];

    return (
        <div className="account-nav">
            <div className="list-group">
                {items.map((it) => {
                    const active = it.activeWhen(url);
                    return (
                        <Link
                            key={it.href}
                            href={it.href}
                            className={`list-group-item list-group-item-action ${active ? 'active' : ''}`}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div>{it.title}</div>
                                    {it.desc ? <div className="text-muted small">{it.desc}</div> : null}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

import ApplicationLogo from '@/Components/ApplicationLogo';
import TTButton from '@/Components/UI/TTButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

const navItems = [
    { label: 'Yfirlit', route: 'admin.dashboard', active: 'admin.dashboard' },
    { label: 'Notendur', route: 'admin.users.index', active: 'admin.users.*' },
    { label: 'Auglýsingar', route: 'admin.ads.index', active: 'admin.ads.*' },
    { label: 'Flokkar', route: 'admin.categories.index', active: 'admin.categories.*' },
    { label: 'Svæði', route: 'admin.regions.index', active: 'admin.regions.*' },
    { label: 'Póstnúmer', route: 'admin.postcodes.index', active: 'admin.postcodes.*' },
];

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <Link
                            href="/"
                            className="navbar-brand d-flex align-items-center gap-2 mb-0"
                        >
                            <ApplicationLogo
                                className="text-dark"
                                style={{ height: '36px', width: 'auto' }}
                            />
                            <span className="fw-semibold text-secondary small">
                                Admin stjórnborð
                            </span>
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="nav-link d-none d-lg-inline text-secondary"
                        >
                            Til baka í notandaborð
                        </Link>
                    </div>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#adminNavbar"
                        aria-controls="adminNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="adminNavbar">
                        <ul className="navbar-nav ms-auto align-items-lg-center">
                            <li className="nav-item d-lg-none">
                                <Link
                                    href={route('dashboard')}
                                    className="nav-link"
                                >
                                    Til baka í notandaborð
                                </Link>
                            </li>
                            {navItems.map((item) => (
                                <li
                                    key={item.route}
                                    className="nav-item d-lg-none"
                                >
                                    <Link
                                        href={route(item.route)}
                                        className={`nav-link ${
                                            route().current(item.active)
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="nav-item dropdown ms-lg-3">
                                <TTButton
                                    look="outline"
                                    variant="slate"
                                    className="dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {user.name}
                                </TTButton>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link
                                            href={route('profile.edit')}
                                            className="dropdown-item"
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="dropdown-item"
                                        >
                                            Log Out
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <main className="container py-4">
                {header && <header className="mb-4">{header}</header>}
                <div className="row g-4">
                    <aside className="col-lg-3 d-none d-lg-block">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <p className="text-uppercase small text-muted fw-semibold mb-3">
                                    Stjórnun
                                </p>
                                <div className="list-group list-group-flush">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.route}
                                            href={route(item.route)}
                                            className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${
                                                route().current(item.active)
                                                    ? 'active'
                                                    : ''
                                            }`}
                                        >
                                            <span>{item.label}</span>
                                            <span aria-hidden="true">›</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                    <section className="col-lg-9">{children}</section>
                </div>
            </main>
        </div>
    );
}

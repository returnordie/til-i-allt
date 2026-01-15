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
            <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
                <div className="container">
                    <Link href={route('admin.dashboard')} className="navbar-brand fw-bold">
                        Admin stjórnborð
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#adminNav"
                        aria-controls="adminNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="adminNav">
                        <div className="navbar-nav me-auto">
                            <Link
                                href={route('dashboard')}
                                className="nav-link"
                            >
                                Til baka í notandaborð
                            </Link>
                        </div>
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {user.name}
                            </button>
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
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container py-4">
                {header && <div className="mb-4">{header}</div>}
                <div className="row g-4">
                    <aside className="col-12 col-lg-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <p className="text-uppercase text-muted small fw-semibold mb-3">
                                    Stjórnun
                                </p>
                                <div className="list-group list-group-flush">
                                    {navItems.map((item) => {
                                        const isActive = route().current(item.active);
                                        return (
                                            <Link
                                                key={item.route}
                                                href={route(item.route)}
                                                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${
                                                    isActive ? 'active' : ''
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                <span className="small">›</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>
                    <section className="col-12 col-lg-9">{children}</section>
                </div>
            </main>
        </div>
    );
}

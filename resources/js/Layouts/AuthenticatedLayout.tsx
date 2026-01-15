import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
                <div className="container">
                    <Link
                        href="/"
                        className="navbar-brand d-flex align-items-center gap-2"
                    >
                        <ApplicationLogo
                            className="text-dark"
                            style={{ height: '36px', width: 'auto' }}
                        />
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link
                                    href={route('dashboard')}
                                    className={`nav-link ${
                                        route().current('dashboard')
                                            ? 'active'
                                            : ''
                                    }`}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            {isAdmin && (
                                <li className="nav-item">
                                    <Link
                                        href={route('admin.dashboard')}
                                        className={`nav-link ${
                                            route().current('admin.*')
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        Admin
                                    </Link>
                                </li>
                            )}
                        </ul>

                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown">
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
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-bottom">
                    <div className="container py-4">{header}</div>
                </header>
            )}

            <main className="container py-4">{children}</main>
        </div>
    );
}

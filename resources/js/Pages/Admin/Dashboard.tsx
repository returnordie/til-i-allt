import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface DashboardProps {
    stats: {
        users: number;
        ads: number;
        categories: number;
        regions: number;
        postcodes: number;
        deals: number;
        conversations: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at?: string | null;
    }>;
    recentAds: Array<{
        id: number;
        title: string;
        status: string;
        price?: number | null;
        currency?: string | null;
        created_at?: string | null;
        user?: { id: number; name: string | null } | null;
    }>;
}

const statCards = [
    { label: 'Notendur', key: 'users', routeName: 'admin.users.index' },
    { label: 'Auglýsingar', key: 'ads', routeName: 'admin.ads.index' },
    { label: 'Flokkar', key: 'categories', routeName: 'admin.categories.index' },
    { label: 'Svæði', key: 'regions', routeName: 'admin.regions.index' },
    { label: 'Póstnúmer', key: 'postcodes', routeName: 'admin.postcodes.index' },
    { label: 'Viðskipti', key: 'deals', routeName: 'admin.ads.index' },
    { label: 'Samtöl', key: 'conversations', routeName: 'admin.users.index' },
] as const;

export default function Dashboard({ stats, recentUsers, recentAds }: DashboardProps) {
    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">Admin</p>
                    <h1 className="h3 mb-0">Yfirlit stjórnborðs</h1>
                </div>
            }
        >
            <Head title="Admin stjórnborð" />

            <div className="row g-3">
                {statCards.map((card) => (
                    <div key={card.key} className="col-12 col-md-6 col-xl-4">
                        <Link
                            href={route(card.routeName)}
                            className="text-decoration-none"
                        >
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <p className="text-muted small mb-1">
                                        {card.label}
                                    </p>
                                    <p className="h2 mb-3">
                                        {stats[card.key]}
                                    </p>
                                    <span className="text-primary small fw-semibold">
                                        Sjá nánar →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="row g-4 mt-1">
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h5 mb-0">Nýjustu notendur</h2>
                                <Link
                                    href={route('admin.users.index')}
                                    className="text-decoration-none small"
                                >
                                    Skoða alla
                                </Link>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="border rounded-3 p-3 d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <div className="fw-semibold">
                                                {user.name}
                                            </div>
                                            <div className="text-muted small">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-uppercase small text-muted">
                                                {user.role}
                                            </div>
                                            <div className="text-muted small">
                                                {user.created_at ?? '—'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h2 className="h5 mb-0">Nýjustu auglýsingar</h2>
                                <Link
                                    href={route('admin.ads.index')}
                                    className="text-decoration-none small"
                                >
                                    Skoða allar
                                </Link>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {recentAds.map((ad) => (
                                    <div
                                        key={ad.id}
                                        className="border rounded-3 p-3"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="fw-semibold">
                                                {ad.title}
                                            </div>
                                            <span className="badge text-bg-secondary text-uppercase">
                                                {ad.status}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2 text-muted small">
                                            <span>
                                                {ad.user?.name
                                                    ? `Eigandi: ${ad.user.name}`
                                                    : 'Enginn eigandi'}
                                            </span>
                                            <span>
                                                {ad.price
                                                    ? `${ad.price} ${ad.currency ?? ''}`
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

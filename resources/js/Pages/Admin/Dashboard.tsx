import AdminLayout from '@/Layouts/AdminLayout';
import TTButton from '@/Components/UI/TTButton';
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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Admin
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Yfirlit stjórnborðs
                    </h1>
                </div>
            }
        >
            <Head title="Admin stjórnborð" />

            <section className="row g-4">
                {statCards.map((card) => (
                    <div key={card.key} className="col-md-6 col-xl-3">
                        <Link
                            href={route(card.routeName)}
                            className="card h-100 shadow-sm text-decoration-none"
                        >
                            <div className="card-body">
                                <p className="small text-muted fw-semibold mb-2">
                                    {card.label}
                                </p>
                                <p className="display-6 fw-semibold text-dark mb-2">
                                    {stats[card.key]}
                                </p>
                                <p className="small text-muted mb-0">
                                    Sjá nánar →
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </section>

            <section className="row g-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h2 className="h6 fw-semibold mb-0">
                                    Áttvísandi hnappahópur
                                </h2>
                                <span className="text-muted small">
                                    Demo
                                </span>
                            </div>
                            <div className="tt-dir-group">
                                <TTButton
                                    type="button"
                                    variant="slate"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Yfirlit
                                </TTButton>
                                <TTButton
                                    type="button"
                                    variant="blue"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Notendur
                                </TTButton>
                                <TTButton
                                    type="button"
                                    variant="green"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Auglýsingar
                                </TTButton>
                                <TTButton
                                    type="button"
                                    variant="teal"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Flokkar
                                </TTButton>
                                <TTButton
                                    type="button"
                                    variant="amber"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Svæði
                                </TTButton>
                                <TTButton
                                    type="button"
                                    variant="red"
                                    look="solid"
                                    className="tt-dir-btn"
                                >
                                    Póstnúmer
                                </TTButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="row g-4">
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h2 className="h5 fw-semibold mb-0">
                            Nýjustu notendur
                                </h2>
                                <TTButton
                                    as="link"
                                    href={route('admin.users.index')}
                                    look="ghost"
                                    variant="slate"
                                    size="sm"
                                    className="px-0"
                                >
                                    Skoða alla
                                </TTButton>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="border rounded-3 bg-light px-3 py-2 d-flex align-items-center justify-content-between"
                                    >
                                        <div>
                                            <p className="mb-1 fw-semibold">
                                                {user.name}
                                            </p>
                                            <p className="mb-0 small text-muted">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            <p className="mb-1 small text-uppercase text-muted fw-semibold">
                                                {user.role}
                                            </p>
                                            <p className="mb-0 small text-muted">
                                                {user.created_at ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h2 className="h5 fw-semibold mb-0">
                            Nýjustu auglýsingar
                                </h2>
                                <TTButton
                                    as="link"
                                    href={route('admin.ads.index')}
                                    look="ghost"
                                    variant="slate"
                                    size="sm"
                                    className="px-0"
                                >
                                    Skoða allar
                                </TTButton>
                            </div>
                            <div className="d-flex flex-column gap-3">
                                {recentAds.map((ad) => (
                                    <div
                                        key={ad.id}
                                        className="border rounded-3 bg-light px-3 py-2"
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <p className="mb-1 fw-semibold">
                                                {ad.title}
                                            </p>
                                            <span className="badge bg-secondary text-uppercase">
                                                {ad.status}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between small text-muted">
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
            </section>
        </AdminLayout>
    );
}

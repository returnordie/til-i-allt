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
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Admin
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Yfirlit stjórnborðs
                    </h1>
                </div>
            }
        >
            <Head title="Admin stjórnborð" />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <Link
                        key={card.key}
                        href={route(card.routeName)}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                    >
                        <p className="text-sm font-medium text-slate-500">
                            {card.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {stats[card.key]}
                        </p>
                        <p className="mt-3 text-xs font-medium text-slate-400">
                            Sjá nánar →
                        </p>
                    </Link>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Nýjustu notendur
                        </h2>
                        <Link
                            href={route('admin.users.index')}
                            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            Skoða alla
                        </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {recentUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium uppercase text-slate-400">
                                        {user.role}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {user.created_at ?? '—'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Nýjustu auglýsingar
                        </h2>
                        <Link
                            href={route('admin.ads.index')}
                            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            Skoða allar
                        </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {recentAds.map((ad) => (
                            <div
                                key={ad.id}
                                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {ad.title}
                                    </p>
                                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                                        {ad.status}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>
                                        {ad.user?.name ? `Eigandi: ${ad.user.name}` : 'Enginn eigandi'}
                                    </span>
                                    <span>
                                        {ad.price ? `${ad.price} ${ad.currency ?? ''}` : '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

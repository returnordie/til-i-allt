import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface AdListItem {
    id: number;
    title: string;
    status: string;
    price?: number | null;
    currency?: string | null;
    created_at?: string | null;
    user?: { id: number; name: string | null } | null;
    category?: { id: number; name: string | null } | null;
}

interface AdsPageProps {
    filters: { search: string; status: string };
    statusOptions: string[];
    ads: {
        data: AdListItem[];
        links: PaginatorLink[];
        meta: { total: number; from: number | null; to: number | null };
    };
}

export default function Index({ filters, statusOptions, ads }: AdsPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('admin.ads.index'),
            { search: search || undefined, status: status || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Auglýsingar
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Stjórna auglýsingum
                    </h1>
                </div>
            }
        >
            <Head title="Auglýsingar" />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm font-medium text-slate-600">
                        {ads.meta.total} auglýsingar
                    </p>
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            placeholder="Leita eftir titli"
                        />
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="">Allar stöður</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Sía
                        </button>
                    </form>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-3">Titill</th>
                                <th className="px-3 py-3">Eigandi</th>
                                <th className="px-3 py-3">Flokkur</th>
                                <th className="px-3 py-3">Verð</th>
                                <th className="px-3 py-3">Staða</th>
                                <th className="px-3 py-3 text-right">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ads.data.map((ad) => (
                                <tr key={ad.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        {ad.title}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {ad.user?.name ?? '—'}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {ad.category?.name ?? '—'}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {ad.price ? `${ad.price} ${ad.currency ?? ''}` : '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                                            {ad.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Link
                                            href={route('admin.ads.edit', ad.id)}
                                            className="text-sm font-semibold text-slate-900 hover:text-slate-600"
                                        >
                                            Breyta
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination links={ads.links} />
            </section>
        </AdminLayout>
    );
}

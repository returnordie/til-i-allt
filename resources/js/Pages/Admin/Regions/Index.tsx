import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface RegionListItem {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

interface RegionsPageProps {
    regions: {
        data: RegionListItem[];
        links: PaginatorLink[];
        meta: { total: number; from: number | null; to: number | null };
    };
}

export default function Index({ regions }: RegionsPageProps) {
    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Svæði
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Stjórna svæðum
                    </h1>
                </div>
            }
        >
            <Head title="Svæði" />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">
                        {regions.meta.total} svæði
                    </p>
                    <Link
                        href={route('admin.regions.create')}
                        className="rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                        Nýtt svæði
                    </Link>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-3">Nafn</th>
                                <th className="px-3 py-3">Slug</th>
                                <th className="px-3 py-3">Röðun</th>
                                <th className="px-3 py-3">Staða</th>
                                <th className="px-3 py-3 text-right">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {regions.data.map((region) => (
                                <tr key={region.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        {region.name}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {region.slug}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {region.sort_order}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                region.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}
                                        >
                                            {region.is_active
                                                ? 'Virkur'
                                                : 'Óvirkur'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Link
                                            href={route(
                                                'admin.regions.edit',
                                                region.id,
                                            )}
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
                <Pagination links={regions.links} />
            </section>
        </AdminLayout>
    );
}

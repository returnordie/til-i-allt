import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface PostcodeListItem {
    id: number;
    code: string;
    name: string;
    is_active: boolean;
    region?: { id: number; name: string } | null;
}

interface PostcodesPageProps {
    filters: { region_id: number | null };
    regions: Array<{ id: number; name: string }>;
    postcodes: {
        data: PostcodeListItem[];
        links: PaginatorLink[];
        meta: { total: number; from: number | null; to: number | null };
    };
}

export default function Index({ filters, regions, postcodes }: PostcodesPageProps) {
    const [regionId, setRegionId] = useState(
        filters.region_id ? String(filters.region_id) : '',
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('admin.postcodes.index'),
            { region_id: regionId || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Póstnúmer
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Stjórna póstnúmerum
                    </h1>
                </div>
            }
        >
            <Head title="Póstnúmer" />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <form onSubmit={submit} className="flex flex-wrap gap-2">
                        <select
                            value={regionId}
                            onChange={(event) =>
                                setRegionId(event.target.value)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="">Öll svæði</option>
                            {regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name}
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
                    <Link
                        href={route('admin.postcodes.create')}
                        className="rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                        Nýtt póstnúmer
                    </Link>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-3">Póstnúmer</th>
                                <th className="px-3 py-3">Nafn</th>
                                <th className="px-3 py-3">Svæði</th>
                                <th className="px-3 py-3">Staða</th>
                                <th className="px-3 py-3 text-right">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {postcodes.data.map((postcode) => (
                                <tr key={postcode.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        {postcode.code}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {postcode.name}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {postcode.region?.name ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                postcode.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}
                                        >
                                            {postcode.is_active
                                                ? 'Virkur'
                                                : 'Óvirkur'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Link
                                            href={route(
                                                'admin.postcodes.edit',
                                                postcode.id,
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
                <Pagination links={postcodes.links} />
            </section>
        </AdminLayout>
    );
}

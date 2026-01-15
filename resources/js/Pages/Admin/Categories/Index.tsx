import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface CategoryListItem {
    id: number;
    name: string;
    slug: string;
    section: string;
    sort_order: number;
    is_active: boolean;
    parent?: { id: number; name: string } | null;
}

interface CategoriesPageProps {
    filters: { section: string };
    sections: string[];
    categories: {
        data: CategoryListItem[];
        links: PaginatorLink[];
        meta: { total: number; from: number | null; to: number | null };
    };
}

export default function Index({ filters, sections, categories }: CategoriesPageProps) {
    const [section, setSection] = useState(filters.section ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('admin.categories.index'),
            { section: section || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Flokkar
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Stjórna flokkum
                    </h1>
                </div>
            }
        >
            <Head title="Flokkar" />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <form onSubmit={submit} className="flex flex-wrap gap-2">
                        <select
                            value={section}
                            onChange={(event) => setSection(event.target.value)}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option value="">Allar deildir</option>
                            {sections.map((item) => (
                                <option key={item} value={item}>
                                    {item}
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
                        href={route('admin.categories.create')}
                        className="rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900"
                    >
                        Nýr flokkur
                    </Link>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-3">Nafn</th>
                                <th className="px-3 py-3">Slug</th>
                                <th className="px-3 py-3">Deild</th>
                                <th className="px-3 py-3">Foreldri</th>
                                <th className="px-3 py-3">Röðun</th>
                                <th className="px-3 py-3">Staða</th>
                                <th className="px-3 py-3 text-right">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.data.map((category) => (
                                <tr key={category.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        {category.name}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {category.slug}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {category.section}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {category.parent?.name ?? '—'}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {category.sort_order}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                category.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}
                                        >
                                            {category.is_active
                                                ? 'Virkur'
                                                : 'Óvirkur'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Link
                                            href={route(
                                                'admin.categories.edit',
                                                category.id,
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
                <Pagination links={categories.links} />
            </section>
        </AdminLayout>
    );
}

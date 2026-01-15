import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface UserListItem {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    role: string;
    is_active: boolean;
    created_at?: string | null;
}

interface UsersPageProps {
    filters: { search: string };
    users: {
        data: UserListItem[];
        links: PaginatorLink[];
        meta: { total: number; from: number | null; to: number | null };
    };
}

export default function Index({ filters, users }: UsersPageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route('admin.users.index'),
            { search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Notendur
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Stjórna notendum
                    </h1>
                </div>
            }
        >
            <Head title="Notendur" />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600">
                            {users.meta.total} notendur
                        </p>
                    </div>
                    <form onSubmit={submit} className="flex w-full gap-2 md:w-auto">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            placeholder="Leita eftir nafni, email eða notendanafni"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Leita
                        </button>
                    </form>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-3 py-3">Nafn</th>
                                <th className="px-3 py-3">Email</th>
                                <th className="px-3 py-3">Notendanafn</th>
                                <th className="px-3 py-3">Hlutverk</th>
                                <th className="px-3 py-3">Staða</th>
                                <th className="px-3 py-3 text-right">Aðgerðir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-medium text-slate-900">
                                        {user.name}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {user.email}
                                    </td>
                                    <td className="px-3 py-3 text-slate-600">
                                        {user.username ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                user.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}
                                        >
                                            {user.is_active ? 'Virkur' : 'Óvirkur'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                        <Link
                                            href={route('admin.users.edit', user.id)}
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
                <Pagination links={users.links} />
            </section>
        </AdminLayout>
    );
}

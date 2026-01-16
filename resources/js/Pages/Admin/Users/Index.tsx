import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, router } from '@inertiajs/react';
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
    const safeFilters = filters ?? { search: '' };
    const safeUsers = {
        data: users?.data ?? [],
        links: users?.links ?? [],
        meta: users?.meta ?? { total: 0, from: null, to: null },
    };
    const [search, setSearch] = useState(safeFilters.search ?? '');

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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Notendur
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Stjórna notendum
                    </h1>
                </div>
            }
        >
            <Head title="Notendur" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-md-between">
                        <div>
                            <p className="small text-muted mb-0">
                                {safeUsers.meta.total} notendur
                            </p>
                        </div>
                        <form
                            onSubmit={submit}
                            className="d-flex flex-column flex-sm-row gap-2 w-100"
                        >
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="form-control"
                                placeholder="Leita eftir nafni, email eða notendanafni"
                            />
                            <TTButton type="submit" variant="dark" look="solid">
                                Leita
                            </TTButton>
                        </form>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nafn</th>
                                    <th>Email</th>
                                    <th>Notendanafn</th>
                                    <th>Hlutverk</th>
                                    <th>Staða</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeUsers.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="fw-semibold">
                                            {user.name}
                                        </td>
                                        <td className="text-muted">
                                            {user.email}
                                        </td>
                                        <td className="text-muted">
                                            {user.username ?? '—'}
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.is_active
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                }`}
                                            >
                                                {user.is_active
                                                    ? 'Virkur'
                                                    : 'Óvirkur'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <TTButton
                                                as="link"
                                                href={route(
                                                    'admin.users.edit',
                                                    user.id,
                                                )}
                                                size="sm"
                                                look="outline"
                                                variant="slate"
                                            >
                                                Breyta
                                            </TTButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={safeUsers.links} />
                </div>
            </section>
        </AdminLayout>
    );
}

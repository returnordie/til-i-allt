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
                    <p className="text-muted text-uppercase small mb-1">
                        Auglýsingar
                    </p>
                    <h1 className="h3 mb-0">Stjórna auglýsingum</h1>
                </div>
            }
        >
            <Head title="Auglýsingar" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
                        <div className="text-muted small">
                            {ads.meta.total} auglýsingar
                        </div>
                        <form onSubmit={submit} className="d-flex flex-wrap gap-2">
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="form-control"
                                placeholder="Leita eftir titli"
                            />
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="form-select"
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
                                className="btn btn-dark"
                            >
                                Sía
                            </button>
                        </form>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Titill</th>
                                    <th>Eigandi</th>
                                    <th>Flokkur</th>
                                    <th>Verð</th>
                                    <th>Staða</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ads.data.map((ad) => (
                                    <tr key={ad.id}>
                                        <td className="fw-semibold">
                                            {ad.title}
                                        </td>
                                        <td>{ad.user?.name ?? '—'}</td>
                                        <td>{ad.category?.name ?? '—'}</td>
                                        <td>
                                            {ad.price
                                                ? `${ad.price} ${ad.currency ?? ''}`
                                                : '—'}
                                        </td>
                                        <td>
                                            <span className="badge text-bg-secondary text-uppercase">
                                                {ad.status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                href={route(
                                                    'admin.ads.edit',
                                                    ad.id,
                                                )}
                                                className="btn btn-sm btn-outline-dark"
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
                </div>
            </section>
        </AdminLayout>
    );
}

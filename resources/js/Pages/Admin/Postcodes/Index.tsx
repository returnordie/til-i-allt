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
    const safeFilters = filters ?? { region_id: null };
    const safeRegions = regions ?? [];
    const safePostcodes = {
        data: postcodes?.data ?? [],
        links: postcodes?.links ?? [],
        meta: postcodes?.meta ?? { total: 0, from: null, to: null },
    };
    const [regionId, setRegionId] = useState(
        safeFilters.region_id ? String(safeFilters.region_id) : '',
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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Póstnúmer
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Stjórna póstnúmerum
                    </h1>
                </div>
            }
        >
            <Head title="Póstnúmer" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-lg-between">
                        <form onSubmit={submit} className="d-flex flex-wrap gap-2">
                            <select
                                value={regionId}
                                onChange={(event) =>
                                    setRegionId(event.target.value)
                                }
                                className="form-select"
                            >
                                <option value="">Öll svæði</option>
                                {safeRegions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-dark">
                                Sía
                            </button>
                        </form>
                        <Link
                            href={route('admin.postcodes.create')}
                            className="btn btn-outline-dark"
                        >
                            Nýtt póstnúmer
                        </Link>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Póstnúmer</th>
                                    <th>Nafn</th>
                                    <th>Svæði</th>
                                    <th>Staða</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safePostcodes.data.map((postcode) => (
                                    <tr key={postcode.id}>
                                        <td className="fw-semibold">
                                            {postcode.code}
                                        </td>
                                        <td className="text-muted">
                                            {postcode.name}
                                        </td>
                                        <td className="text-muted">
                                            {postcode.region?.name ?? '—'}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    postcode.is_active
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                }`}
                                            >
                                                {postcode.is_active
                                                    ? 'Virkur'
                                                    : 'Óvirkur'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                href={route(
                                                    'admin.postcodes.edit',
                                                    postcode.id,
                                                )}
                                                className="btn btn-sm btn-outline-secondary"
                                            >
                                                Breyta
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={safePostcodes.links} />
                </div>
            </section>
        </AdminLayout>
    );
}

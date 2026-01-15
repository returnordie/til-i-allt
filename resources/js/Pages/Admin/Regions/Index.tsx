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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Svæði
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Stjórna svæðum
                    </h1>
                </div>
            }
        >
            <Head title="Svæði" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                        <p className="small text-muted mb-0">
                        {regions.meta.total} svæði
                    </p>
                    <Link
                        href={route('admin.regions.create')}
                        className="btn btn-outline-dark"
                    >
                        Nýtt svæði
                    </Link>
                </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nafn</th>
                                    <th>Slug</th>
                                    <th>Röðun</th>
                                    <th>Staða</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regions.data.map((region) => (
                                    <tr key={region.id}>
                                        <td className="fw-semibold">
                                            {region.name}
                                        </td>
                                        <td className="text-muted">
                                            {region.slug}
                                        </td>
                                        <td className="text-muted">
                                            {region.sort_order}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    region.is_active
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                }`}
                                            >
                                                {region.is_active
                                                    ? 'Virkur'
                                                    : 'Óvirkur'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                href={route(
                                                    'admin.regions.edit',
                                                    region.id,
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
                    <Pagination links={regions.links} />
                </div>
            </section>
        </AdminLayout>
    );
}

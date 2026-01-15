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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Flokkar
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Stjórna flokkum
                    </h1>
                </div>
            }
        >
            <Head title="Flokkar" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-lg-between">
                        <form onSubmit={submit} className="d-flex flex-wrap gap-2">
                            <select
                                value={section}
                                onChange={(event) =>
                                    setSection(event.target.value)
                                }
                                className="form-select"
                            >
                                <option value="">Allar deildir</option>
                                {sections.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-dark">
                                Sía
                            </button>
                        </form>
                        <Link
                            href={route('admin.categories.create')}
                            className="btn btn-outline-dark"
                        >
                            Nýr flokkur
                        </Link>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nafn</th>
                                    <th>Slug</th>
                                    <th>Deild</th>
                                    <th>Foreldri</th>
                                    <th>Röðun</th>
                                    <th>Staða</th>
                                    <th className="text-end">Aðgerðir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.map((category) => (
                                    <tr key={category.id}>
                                        <td className="fw-semibold">
                                            {category.name}
                                        </td>
                                        <td className="text-muted">
                                            {category.slug}
                                        </td>
                                        <td className="text-muted">
                                            {category.section}
                                        </td>
                                        <td className="text-muted">
                                            {category.parent?.name ?? '—'}
                                        </td>
                                        <td className="text-muted">
                                            {category.sort_order}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    category.is_active
                                                        ? 'bg-success'
                                                        : 'bg-danger'
                                                }`}
                                            >
                                                {category.is_active
                                                    ? 'Virkur'
                                                    : 'Óvirkur'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Link
                                                href={route(
                                                    'admin.categories.edit',
                                                    category.id,
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
                    <Pagination links={categories.links} />
                </div>
            </section>
        </AdminLayout>
    );
}

import Pagination, { PaginatorLink } from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import TTButton from '@/Components/UI/TTButton';
import { Head, router } from '@inertiajs/react';
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
    const safeFilters = filters ?? { section: '' };
    const safeSections = sections ?? [];
    const safeCategories = {
        data: categories?.data ?? [],
        links: categories?.links ?? [],
        meta: categories?.meta ?? { total: 0, from: null, to: null },
    };
    const [section, setSection] = useState(safeFilters.section ?? '');

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
                                {safeSections.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <TTButton type="submit" variant="dark" look="solid">
                                Sía
                            </TTButton>
                        </form>
                        <TTButton
                            as="link"
                            href={route('admin.categories.create')}
                            look="outline"
                            variant="dark"
                        >
                            Nýr flokkur
                        </TTButton>
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
                                {safeCategories.data.map((category) => (
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
                                            <TTButton
                                                as="link"
                                                href={route(
                                                    'admin.categories.edit',
                                                    category.id,
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
                    <Pagination links={safeCategories.links} />
                </div>
            </section>
        </AdminLayout>
    );
}

import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface CreateProps {
    sections: string[];
    parents: Array<{ id: number; name: string; section: string }>;
}

export default function Create({ sections, parents }: CreateProps) {
    const { data, setData, post, processing } = useForm({
        name: '',
        slug: '',
        section: sections[0] ?? '',
        parent_id: '',
        icon: '',
        hero_art: '',
        sort_order: 0,
        is_active: true,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">Flokkar</p>
                    <h1 className="h3 mb-0">Nýr flokkur</h1>
                </div>
            }
        >
            <Head title="Nýr flokkur" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label">
                                Nafn
                            </label>
                            <input
                                id="name"
                                className="form-control"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="slug" className="form-label">
                                Slug
                            </label>
                            <input
                                id="slug"
                                className="form-control"
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="section" className="form-label">
                                Deild
                            </label>
                            <select
                                id="section"
                                className="form-select"
                                value={data.section}
                                onChange={(e) =>
                                    setData('section', e.target.value)
                                }
                            >
                                {sections.map((section) => (
                                    <option key={section} value={section}>
                                        {section}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="parent" className="form-label">
                                Foreldri
                            </label>
                            <select
                                id="parent"
                                className="form-select"
                                value={data.parent_id}
                                onChange={(e) =>
                                    setData('parent_id', e.target.value)
                                }
                            >
                                <option value="">—</option>
                                {parents.map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                        {parent.section} · {parent.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="icon" className="form-label">
                                Tákn
                            </label>
                            <input
                                id="icon"
                                className="form-control"
                                value={data.icon}
                                onChange={(e) =>
                                    setData('icon', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="hero_art" className="form-label">
                                Hero art
                            </label>
                            <input
                                id="hero_art"
                                className="form-control"
                                value={data.hero_art}
                                onChange={(e) =>
                                    setData('hero_art', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="sort_order" className="form-label">
                                Röðun
                            </label>
                            <input
                                id="sort_order"
                                type="number"
                                className="form-control"
                                value={data.sort_order}
                                onChange={(e) =>
                                    setData('sort_order', Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="col-12">
                            <div className="form-check form-switch">
                                <input
                                    id="is_active"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="is_active"
                                    className="form-check-label"
                                >
                                    Virkur flokkur
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() =>
                                post(route('admin.categories.store'))
                            }
                            disabled={processing}
                        >
                            Stofna flokk
                        </button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface RegionDetail {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

interface EditProps {
    region: RegionDetail;
}

export default function Edit({ region }: EditProps) {
    const { data, setData, put, processing } = useForm({
        name: region.name,
        slug: region.slug,
        sort_order: region.sort_order,
        is_active: region.is_active,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">
                        Svæði #{region.id}
                    </p>
                    <h1 className="h3 mb-0">Breyta svæði</h1>
                </div>
            }
        >
            <Head title={`Svæði ${region.name}`} />

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
                                    Virkt svæði
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() =>
                                put(route('admin.regions.update', region.id))
                            }
                            disabled={processing}
                        >
                            Vista breytingar
                        </button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface CreateProps {
    regions: Array<{ id: number; name: string }>;
}

export default function Create({ regions }: CreateProps) {
    const { data, setData, post, processing } = useForm({
        code: '',
        name: '',
        region_id: regions[0]?.id ?? '',
        is_active: true,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">
                        Póstnúmer
                    </p>
                    <h1 className="h3 mb-0">Nýtt póstnúmer</h1>
                </div>
            }
        >
            <Head title="Nýtt póstnúmer" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="code" className="form-label">
                                Póstnúmer
                            </label>
                            <input
                                id="code"
                                className="form-control"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value)
                                }
                            />
                        </div>
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
                            <label htmlFor="region" className="form-label">
                                Svæði
                            </label>
                            <select
                                id="region"
                                className="form-select"
                                value={data.region_id}
                                onChange={(e) =>
                                    setData('region_id', e.target.value)
                                }
                            >
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.name}
                                    </option>
                                ))}
                            </select>
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
                                    Virkt póstnúmer
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() =>
                                post(route('admin.postcodes.store'))
                            }
                            disabled={processing}
                        >
                            Stofna póstnúmer
                        </button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

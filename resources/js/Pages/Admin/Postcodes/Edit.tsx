import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface PostcodeDetail {
    id: number;
    code: string;
    name: string;
    region_id: number;
    is_active: boolean;
}

interface EditProps {
    postcode: PostcodeDetail;
    regions: Array<{ id: number; name: string }>;
}

export default function Edit({ postcode, regions }: EditProps) {
    const { data, setData, put, processing } = useForm({
        code: postcode.code,
        name: postcode.name,
        region_id: postcode.region_id,
        is_active: postcode.is_active,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">
                        Póstnúmer #{postcode.id}
                    </p>
                    <h1 className="h3 mb-0">Breyta póstnúmeri</h1>
                </div>
            }
        >
            <Head title={`Póstnúmer ${postcode.code}`} />

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
                                    setData('region_id', Number(e.target.value))
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
                                put(route('admin.postcodes.update', postcode.id))
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

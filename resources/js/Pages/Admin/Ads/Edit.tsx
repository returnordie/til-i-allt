import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface AdDetail {
    id: number;
    title: string;
    status: string;
    price?: number | null;
    currency?: string | null;
    category_id?: number | null;
    expires_at?: string | null;
    negotiable: boolean;
}

interface EditProps {
    ad: AdDetail;
    categories: Array<{ id: number; name: string; section: string }>;
    statusOptions: string[];
}

export default function Edit({ ad, categories, statusOptions }: EditProps) {
    const { data, setData, put, processing } = useForm({
        title: ad.title,
        status: ad.status,
        price: ad.price ?? '',
        currency: ad.currency ?? 'ISK',
        category_id: ad.category_id ?? '',
        expires_at: ad.expires_at ?? '',
        negotiable: ad.negotiable,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-muted text-uppercase small mb-1">
                        Auglýsing #{ad.id}
                    </p>
                    <h1 className="h3 mb-0">Breyta auglýsingu</h1>
                </div>
            }
        >
            <Head title={`Auglýsing ${ad.title}`} />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12">
                            <label htmlFor="title" className="form-label">
                                Titill
                            </label>
                            <input
                                id="title"
                                className="form-control"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="status" className="form-label">
                                Staða
                            </label>
                            <select
                                id="status"
                                className="form-select"
                                value={data.status}
                                onChange={(e) =>
                                    setData('status', e.target.value)
                                }
                            >
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="category" className="form-label">
                                Flokkur
                            </label>
                            <select
                                id="category"
                                className="form-select"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData('category_id', e.target.value)
                                }
                            >
                                <option value="">—</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.section} · {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="price" className="form-label">
                                Verð
                            </label>
                            <input
                                id="price"
                                type="number"
                                className="form-control"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label
                                htmlFor="currency"
                                className="form-label"
                            >
                                Gjaldeyrir
                            </label>
                            <input
                                id="currency"
                                className="form-control"
                                value={data.currency}
                                onChange={(e) =>
                                    setData('currency', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label
                                htmlFor="expires_at"
                                className="form-label"
                            >
                                Rennur út
                            </label>
                            <input
                                id="expires_at"
                                type="date"
                                className="form-control"
                                value={data.expires_at}
                                onChange={(e) =>
                                    setData('expires_at', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-12">
                            <div className="form-check form-switch">
                                <input
                                    id="negotiable"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.negotiable}
                                    onChange={(e) =>
                                        setData('negotiable', e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="negotiable"
                                    className="form-check-label"
                                >
                                    Verð samningshæft
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() =>
                                put(route('admin.ads.update', ad.id))
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

import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Auglýsing #{ad.id}
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Breyta auglýsingu
                    </h1>
                </div>
            }
        >
            <Head title={`Auglýsing ${ad.title}`} />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12">
                        <InputLabel htmlFor="title" value="Titill" />
                        <TextInput
                            id="title"
                            className="mt-1"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <InputLabel htmlFor="status" value="Staða" />
                        <select
                            id="status"
                            className="form-select mt-1"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <InputLabel htmlFor="category" value="Flokkur" />
                        <select
                            id="category"
                            className="form-select mt-1"
                            value={data.category_id}
                            onChange={(e) =>
                                setData('category_id', e.target.value)
                            }
                        >
                            <option value="">—</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.section} · {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <InputLabel htmlFor="price" value="Verð" />
                        <TextInput
                            id="price"
                            type="number"
                            className="mt-1"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <InputLabel htmlFor="currency" value="Gjaldeyrir" />
                        <TextInput
                            id="currency"
                            className="mt-1"
                            value={data.currency}
                            onChange={(e) =>
                                setData('currency', e.target.value)
                            }
                        />
                    </div>
                    <div className="col-md-6">
                        <InputLabel htmlFor="expires_at" value="Rennur út" />
                        <TextInput
                            id="expires_at"
                            type="date"
                            className="mt-1"
                            value={data.expires_at}
                            onChange={(e) =>
                                setData('expires_at', e.target.value)
                            }
                        />
                    </div>
                    <div className="col-md-6 d-flex align-items-center gap-2 pt-2">
                        <Checkbox
                            checked={data.negotiable}
                            onChange={(e) =>
                                setData('negotiable', e.target.checked)
                            }
                        />
                        <span className="text-muted">
                            Verð samningshæft
                        </span>
                    </div>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                    <PrimaryButton
                        onClick={() => put(route('admin.ads.update', ad.id))}
                        disabled={processing}
                    >
                        Vista breytingar
                    </PrimaryButton>
                </div>
                </div>
            </section>
        </AdminLayout>
    );
}

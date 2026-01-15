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
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Auglýsing #{ad.id}
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Breyta auglýsingu
                    </h1>
                </div>
            }
        >
            <Head title={`Auglýsing ${ad.title}`} />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="title" value="Titill" />
                        <TextInput
                            id="title"
                            className="mt-1 block w-full"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="status" value="Staða" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    <div>
                        <InputLabel htmlFor="category" value="Flokkur" />
                        <select
                            id="category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    <div>
                        <InputLabel htmlFor="price" value="Verð" />
                        <TextInput
                            id="price"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="currency" value="Gjaldeyrir" />
                        <TextInput
                            id="currency"
                            className="mt-1 block w-full"
                            value={data.currency}
                            onChange={(e) =>
                                setData('currency', e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="expires_at" value="Rennur út" />
                        <TextInput
                            id="expires_at"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.expires_at}
                            onChange={(e) =>
                                setData('expires_at', e.target.value)
                            }
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            checked={data.negotiable}
                            onChange={(e) =>
                                setData('negotiable', e.target.checked)
                            }
                        />
                        <span className="text-sm text-slate-600">
                            Verð samningshæft
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        onClick={() => put(route('admin.ads.update', ad.id))}
                        disabled={processing}
                    >
                        Vista breytingar
                    </PrimaryButton>
                </div>
            </section>
        </AdminLayout>
    );
}

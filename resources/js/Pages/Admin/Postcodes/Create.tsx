import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Póstnúmer
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Nýtt póstnúmer
                    </h1>
                </div>
            }
        >
            <Head title="Nýtt póstnúmer" />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="code" value="Póstnúmer" />
                        <TextInput
                            id="code"
                            className="mt-1 block w-full"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="name" value="Nafn" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="region" value="Svæði" />
                        <select
                            id="region"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                        />
                        <span className="text-sm text-slate-600">
                            Virkt póstnúmer
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        onClick={() => post(route('admin.postcodes.store'))}
                        disabled={processing}
                    >
                        Stofna póstnúmer
                    </PrimaryButton>
                </div>
            </section>
        </AdminLayout>
    );
}

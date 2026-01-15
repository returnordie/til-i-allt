import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Póstnúmer #{postcode.id}
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Breyta póstnúmeri
                    </h1>
                </div>
            }
        >
            <Head title={`Póstnúmer ${postcode.code}`} />

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
                        onClick={() =>
                            put(
                                route('admin.postcodes.update', postcode.id),
                            )
                        }
                        disabled={processing}
                    >
                        Vista breytingar
                    </PrimaryButton>
                </div>
            </section>
        </AdminLayout>
    );
}

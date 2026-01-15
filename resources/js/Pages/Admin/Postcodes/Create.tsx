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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Póstnúmer
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Nýtt póstnúmer
                    </h1>
                </div>
            }
        >
            <Head title="Nýtt póstnúmer" />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                        <InputLabel htmlFor="code" value="Póstnúmer" />
                        <TextInput
                            id="code"
                            className="mt-1"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                    </div>
                        <div className="col-md-6">
                        <InputLabel htmlFor="name" value="Nafn" />
                        <TextInput
                            id="name"
                            className="mt-1"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>
                        <div className="col-md-6">
                        <InputLabel htmlFor="region" value="Svæði" />
                        <select
                            id="region"
                            className="form-select mt-1"
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
                        <div className="col-md-6 d-flex align-items-center gap-2 pt-2">
                        <Checkbox
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                        />
                            <span className="text-muted">
                            Virkt póstnúmer
                        </span>
                    </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-end">
                    <PrimaryButton
                        onClick={() => post(route('admin.postcodes.store'))}
                        disabled={processing}
                    >
                        Stofna póstnúmer
                    </PrimaryButton>
                </div>
                </div>
            </section>
        </AdminLayout>
    );
}

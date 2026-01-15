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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Póstnúmer #{postcode.id}
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Breyta póstnúmeri
                    </h1>
                </div>
            }
        >
            <Head title={`Póstnúmer ${postcode.code}`} />

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
                </div>
            </section>
        </AdminLayout>
    );
}

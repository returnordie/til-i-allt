import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Svæði #{region.id}
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Breyta svæði
                    </h1>
                </div>
            }
        >
            <Head title={`Svæði ${region.name}`} />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
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
                        <InputLabel htmlFor="slug" value="Slug" />
                        <TextInput
                            id="slug"
                            className="mt-1"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                        />
                    </div>
                        <div className="col-md-6">
                        <InputLabel htmlFor="sort_order" value="Röðun" />
                        <TextInput
                            id="sort_order"
                            type="number"
                            className="mt-1"
                            value={data.sort_order}
                            onChange={(e) =>
                                setData('sort_order', Number(e.target.value))
                            }
                        />
                    </div>
                        <div className="col-md-6 d-flex align-items-center gap-2 pt-2">
                        <Checkbox
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                        />
                            <span className="text-muted">
                            Virkt svæði
                        </span>
                    </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-end">
                    <PrimaryButton
                        onClick={() =>
                            put(route('admin.regions.update', region.id))
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

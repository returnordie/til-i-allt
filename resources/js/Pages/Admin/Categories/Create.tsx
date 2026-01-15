import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface CreateProps {
    sections: string[];
    parents: Array<{ id: number; name: string; section: string }>;
}

export default function Create({ sections, parents }: CreateProps) {
    const { data, setData, post, processing } = useForm({
        name: '',
        slug: '',
        section: sections[0] ?? '',
        parent_id: '',
        icon: '',
        hero_art: '',
        sort_order: 0,
        is_active: true,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Flokkar
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Nýr flokkur
                    </h1>
                </div>
            }
        >
            <Head title="Nýr flokkur" />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
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
                        <InputLabel htmlFor="slug" value="Slug" />
                        <TextInput
                            id="slug"
                            className="mt-1 block w-full"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="section" value="Deild" />
                        <select
                            id="section"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={data.section}
                            onChange={(e) => setData('section', e.target.value)}
                        >
                            {sections.map((section) => (
                                <option key={section} value={section}>
                                    {section}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="parent" value="Foreldri" />
                        <select
                            id="parent"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={data.parent_id}
                            onChange={(e) => setData('parent_id', e.target.value)}
                        >
                            <option value="">—</option>
                            {parents.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.section} · {parent.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="icon" value="Tákn" />
                        <TextInput
                            id="icon"
                            className="mt-1 block w-full"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="hero_art" value="Hero art" />
                        <TextInput
                            id="hero_art"
                            className="mt-1 block w-full"
                            value={data.hero_art}
                            onChange={(e) => setData('hero_art', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="sort_order" value="Röðun" />
                        <TextInput
                            id="sort_order"
                            type="number"
                            className="mt-1 block w-full"
                            value={data.sort_order}
                            onChange={(e) =>
                                setData('sort_order', Number(e.target.value))
                            }
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            checked={data.is_active}
                            onChange={(e) =>
                                setData('is_active', e.target.checked)
                            }
                        />
                        <span className="text-sm text-slate-600">
                            Virkur flokkur
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        onClick={() => post(route('admin.categories.store'))}
                        disabled={processing}
                    >
                        Stofna flokk
                    </PrimaryButton>
                </div>
            </section>
        </AdminLayout>
    );
}

import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

interface UserDetail {
    id: number;
    name: string;
    email: string;
    username?: string | null;
    role: string;
    is_active: boolean;
    show_name: boolean;
    show_phone: boolean;
    created_at?: string | null;
}

interface EditProps {
    user: UserDetail;
    roles: string[];
}

export default function Edit({ user, roles }: EditProps) {
    const { data, setData, put, processing } = useForm({
        name: user.name,
        email: user.email,
        username: user.username ?? '',
        role: user.role,
        is_active: user.is_active,
        show_name: user.show_name,
        show_phone: user.show_phone,
    });

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Notandi #{user.id}
                    </p>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Breyta notanda
                    </h1>
                </div>
            }
        >
            <Head title={`Notandi ${user.name}`} />

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="name" value="Nafn" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="username" value="Notendanafn" />
                            <TextInput
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="role" value="Hlutverk" />
                            <select
                                id="role"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Checkbox
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                            />
                            Virkur aðgangur
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Checkbox
                                checked={data.show_name}
                                onChange={(e) =>
                                    setData('show_name', e.target.checked)
                                }
                            />
                            Sýna nafn
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <Checkbox
                                checked={data.show_phone}
                                onChange={(e) =>
                                    setData('show_phone', e.target.checked)
                                }
                            />
                            Sýna síma
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Stofnað: {user.created_at ?? '—'}
                        </p>
                        <PrimaryButton
                            onClick={() =>
                                put(route('admin.users.update', user.id))
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

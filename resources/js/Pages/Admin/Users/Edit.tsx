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
                    <p className="text-uppercase small text-muted fw-semibold mb-1">
                        Notandi #{user.id}
                    </p>
                    <h1 className="h3 fw-semibold mb-0">
                        Breyta notanda
                    </h1>
                </div>
            }
        >
            <Head title={`Notandi ${user.name}`} />

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
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <InputLabel htmlFor="username" value="Notendanafn" />
                            <TextInput
                                id="username"
                                className="mt-1"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <InputLabel htmlFor="role" value="Hlutverk" />
                            <select
                                id="role"
                                className="form-select mt-1"
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

                    <div className="row g-3 mt-2">
                        <label className="col-md-4 form-check d-flex align-items-center gap-2">
                            <Checkbox
                                checked={data.is_active}
                                onChange={(e) =>
                                    setData('is_active', e.target.checked)
                                }
                            />
                            <span className="text-muted">Virkur aðgangur</span>
                        </label>
                        <label className="col-md-4 form-check d-flex align-items-center gap-2">
                            <Checkbox
                                checked={data.show_name}
                                onChange={(e) =>
                                    setData('show_name', e.target.checked)
                                }
                            />
                            <span className="text-muted">Sýna nafn</span>
                        </label>
                        <label className="col-md-4 form-check d-flex align-items-center gap-2">
                            <Checkbox
                                checked={data.show_phone}
                                onChange={(e) =>
                                    setData('show_phone', e.target.checked)
                                }
                            />
                            <span className="text-muted">Sýna síma</span>
                        </label>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-4">
                        <p className="small text-muted mb-0">
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

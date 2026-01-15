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
                    <p className="text-muted text-uppercase small mb-1">
                        Notandi #{user.id}
                    </p>
                    <h1 className="h3 mb-0">Breyta notanda</h1>
                </div>
            }
        >
            <Head title={`Notandi ${user.name}`} />

            <section className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="name" className="form-label">
                                Nafn
                            </label>
                            <input
                                id="name"
                                className="form-control"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="username" className="form-label">
                                Notendanafn
                            </label>
                            <input
                                id="username"
                                className="form-control"
                                value={data.username}
                                onChange={(e) =>
                                    setData('username', e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="role" className="form-label">
                                Hlutverk
                            </label>
                            <select
                                id="role"
                                className="form-select"
                                value={data.role}
                                onChange={(e) =>
                                    setData('role', e.target.value)
                                }
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12">
                            <div className="form-check form-switch">
                                <input
                                    id="is_active"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData('is_active', e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="is_active"
                                    className="form-check-label"
                                >
                                    Virkur aðgangur
                                </label>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-check form-switch">
                                <input
                                    id="show_name"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.show_name}
                                    onChange={(e) =>
                                        setData('show_name', e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="show_name"
                                    className="form-check-label"
                                >
                                    Sýna nafn
                                </label>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-check form-switch">
                                <input
                                    id="show_phone"
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.show_phone}
                                    onChange={(e) =>
                                        setData('show_phone', e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="show_phone"
                                    className="form-check-label"
                                >
                                    Sýna síma
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted small">
                            Stofnað: {user.created_at ?? '—'}
                        </span>
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() =>
                                put(route('admin.users.update', user.id))
                            }
                            disabled={processing}
                        >
                            Vista breytingar
                        </button>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}

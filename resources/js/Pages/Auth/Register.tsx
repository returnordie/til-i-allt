import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Link, useForm } from '@inertiajs/react';

type RegisterForm = {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <h1 className="h4 mb-1">Búa til aðgang</h1>
            <p className="text-muted mb-4">Nýskráðu þig til að setja inn auglýsingar.</p>

            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nafn</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Notandanafn</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={data.username}
                        autoComplete="username"
                        onChange={(e) => setData('username', e.target.value.toLowerCase())}
                        required
                    />
                    {errors.username ? (
                        <div className="invalid-feedback">{errors.username}</div>
                    ) : (
                        <div className="form-text">
                            Notað í slóðinni: <span className="text-muted">/u/{data.username || 'notandanafn'}</span> (lágstafir, tölur og _)
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Netfang</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={data.email}
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Lykilorð</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password_confirmation" className="form-label">Staðfesta lykilorð</label>
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    {errors.password_confirmation && (
                        <div className="invalid-feedback">{errors.password_confirmation}</div>
                    )}
                </div>

                <div className="d-flex align-items-center justify-content-between">
                    <Link href={route('login')} className="link-secondary text-decoration-none">
                        Nú þegar með aðgang?
                    </Link>

                    <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                        {processing ? 'Skrái…' : 'Nýskrá'}
                    </TTButton>
                </div>
            </form>
        </>
    );
}

Register.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Nýskráning"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

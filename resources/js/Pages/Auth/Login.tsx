// resources/js/Pages/Auth/Login.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, useForm } from '@inertiajs/react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({
                                  status,
                                  canResetPassword,
                              }: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <h1 className="h4 mb-1">Innskráning</h1>
            <p className="text-muted mb-4">Skráðu þig inn til að halda áfram.</p>

            {status && (
                <div className="alert alert-success" role="alert">
                    {status}
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Netfang</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={data.email}
                        autoComplete="username"
                        autoFocus
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
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="remember">
                            Muna mig
                        </label>
                    </div>

                    {canResetPassword && (
                        <Link href={route('password.request')} className="link-secondary text-decoration-none">
                            Gleymt lykilorð?
                        </Link>
                    )}
                </div>

                <div className="d-flex align-items-center justify-content-between">
                    <Link href={route('register')} className="link-secondary text-decoration-none">
                        Ekki með aðgang?
                    </Link>

                    <button type="submit" className="btn tt-btn-cta" disabled={processing}>
                        {processing ? 'Skrái inn…' : 'Innskrá'}
                    </button>
                </div>
            </form>
        </>
    );
}

Login.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Innskráning"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

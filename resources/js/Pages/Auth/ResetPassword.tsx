// resources/js/Pages/Auth/ResetPassword.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <h1 className="h4 mb-1">Endurstilla lykilorð</h1>
            <p className="text-muted mb-4">Veldu nýtt lykilorð fyrir aðganginn þinn.</p>

            <form onSubmit={submit} noValidate>
                <input type="hidden" name="token" value={data.token} />

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Netfang</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Nýtt lykilorð</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="new-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="mb-4">
                    <label htmlFor="password_confirmation" className="form-label">Staðfesta nýtt lykilorð</label>
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

                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn tt-btn-cta" disabled={processing}>
                        {processing ? 'Vista…' : 'Endurstilla lykilorð'}
                    </button>
                </div>
            </form>
        </>
    );
}

ResetPassword.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Endurstilla lykilorð"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

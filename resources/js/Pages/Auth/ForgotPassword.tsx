// resources/js/Pages/Auth/ForgotPassword.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { Link, useForm } from '@inertiajs/react';

type Form = { email: string };

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Form>({ email: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <h1 className="h4 mb-1">Gleymt lykilorð?</h1>
            <p className="text-muted mb-4">
                Sláðu inn netfangið þitt og við sendum þér hlekk til að endurstilla lykilorðið.
            </p>

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

                <div className="d-flex align-items-center justify-content-between">
                    <Link href={route('login')} className="link-secondary text-decoration-none">
                        Til baka í innskráningu
                    </Link>

                    <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                        {processing ? 'Sendi…' : 'Senda endurstillingarhlekk'}
                    </TTButton>
                </div>
            </form>
        </>
    );
}

ForgotPassword.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Gleymt lykilorð"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

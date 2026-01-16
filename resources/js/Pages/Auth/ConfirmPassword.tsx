// resources/js/Pages/Auth/ConfirmPassword.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { useForm } from '@inertiajs/react';

type Form = { password: string };

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Form>({ password: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <h1 className="h4 mb-1">Staðfesta lykilorð</h1>
            <p className="text-muted mb-4">
                Þetta er öruggt svæði. Vinsamlegast staðfestu lykilorðið áður en þú heldur áfram.
            </p>

            <form onSubmit={submit} noValidate>
                <div className="mb-4">
                    <label htmlFor="password" className="form-label">Lykilorð</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={data.password}
                        autoComplete="current-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="d-flex justify-content-end">
                    <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                        {processing ? 'Staðfesti…' : 'Staðfesta'}
                    </TTButton>
                </div>
            </form>
        </>
    );
}

ConfirmPassword.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Staðfesta lykilorð"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

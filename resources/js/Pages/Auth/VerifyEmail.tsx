// resources/js/Pages/Auth/VerifyEmail.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <h1 className="h4 mb-1">Staðfesta netfang</h1>
            <p className="text-muted mb-4">
                Smelltu á hlekkinn sem við sendum í tölvupósti til að staðfesta netfangið þitt.
                Ef þú fékkst ekki póstinn getum við sent annan.
            </p>

            {status === 'verification-link-sent' && (
                <div className="alert alert-success" role="alert">
                    Nýr staðfestingarhlekkur hefur verið sendur á netfangið sem þú skráðir.
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                    <button type="submit" className="btn tt-btn-cta" disabled={processing}>
                        {processing ? 'Sendi…' : 'Senda staðfestingarpóst aftur'}
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="btn btn-outline-secondary"
                    >
                        Skrá út
                    </Link>
                </div>
            </form>
        </>
    );
}

VerifyEmail.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Staðfesta netfang"
        centered
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

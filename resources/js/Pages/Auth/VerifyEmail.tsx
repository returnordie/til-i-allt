// resources/js/Pages/Auth/VerifyEmail.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import TTButton from '@/Components/UI/TTButton';
import { useForm } from '@inertiajs/react';

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
                    <TTButton type="submit" variant="amber" look="solid" disabled={processing}>
                        {processing ? 'Sendi…' : 'Senda staðfestingarpóst aftur'}
                    </TTButton>

                    <TTButton
                        as="link"
                        href={route('logout')}
                        method="post"
                        look="outline"
                        variant="slate"
                    >
                        Skrá út
                    </TTButton>
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

// resources/js/Pages/Ads/Create.tsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import AdForm, { FieldDef } from '@/Pages/Ads/Partials/AdForm';

export default function Create({ fieldDefs = [] }: { fieldDefs: FieldDef[] }) {
    return (
        <div className="container py-4">
            <AdForm
                mode="create"
                submitUrl={route('ads.store')}
                fieldDefs={fieldDefs}
                fieldDefsEndpoint={route('ads.create')}
            />
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        title="Skrá inn auglýsingu"
        centered={false}
        container
        mainClassName="bg-light"
        headerProps={{ hideCatbar: true }}
    >
        {page}
    </AppLayout>
);

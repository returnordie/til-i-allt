import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import AdForm, { AdFormInitial, ExistingAdImage } from '@/Pages/Ads/Partials/AdForm';

type Props = {
    ad: {
        id: number;
        section: 'solutorg' | 'bilatorg' | 'fasteignir';
        category_slug: string;
        subcategory_slug: string;

        listing_type: 'sell' | 'want';
        title: string;
        price: number | null;
        description: string;
        attributes?: Record<string, any>;

        images: ExistingAdImage[];
    };
    fieldDefs?: any[];
};

export default function Edit({ ad, fieldDefs = [] }: Props) {
    const initial: AdFormInitial = {
        section: ad.section,
        category_slug: ad.category_slug,
        subcategory_slug: ad.subcategory_slug,
        listing_type: ad.listing_type,
        title: ad.title,
        price: ad.price,
        description: ad.description,
        attributes: ad.attributes ?? {},
    };

    return (
        <div className="container py-4">
            <AdForm
                mode="edit"
                initial={initial}
                submitUrl={route('ads.update', ad.id)}
                fieldDefs={fieldDefs}
                fieldDefsEndpoint={route('ads.edit', ad.id)}
                existingImages={ad.images}
            />
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout title="Breyta auglýsingu" container mainClassName="bg-light">
        {page}
    </AppLayout>
);

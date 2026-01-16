import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import TTButton from '@/Components/UI/TTButton';
import { Head, useForm, usePage } from '@inertiajs/react';

type Prefs = {
    email_on_message: boolean;
    email_on_notifications: boolean;
    email_on_system: boolean;
    email_on_ad_expiring: boolean;
    email_on_ad_expired: boolean;
};

type PageProps = { prefs: Prefs; flash?: { success?: string } };

export default function Edit() {
    const { props } = usePage<PageProps>();

    const { data, setData, put, processing, recentlySuccessful } = useForm<Prefs>({
        ...props.prefs,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('account.notifications.update'), { preserveScroll: true });
    };

    const toggle = (k: keyof Prefs) => (
        <div className="form-check form-switch mb-2">
            <input
                className="form-check-input"
                type="checkbox"
                checked={data[k]}
                onChange={(e) => setData(k, e.target.checked)}
                id={k}
            />
            <label className="form-check-label" htmlFor={k}>
                {k}
            </label>
        </div>
    );

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Tilkynningar" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h1 className="h4 mb-0">Tilkynningar</h1>
                            <div className="text-muted small">{recentlySuccessful ? 'Vistað.' : null}</div>
                        </div>

                        {props.flash?.success ? (
                            <div className="alert alert-success">{props.flash.success}</div>
                        ) : null}

                        <form onSubmit={submit}>
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="h6 mb-3">Tölvupóststillingar</h2>

                                    <div className="form-check form-switch mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.email_on_message}
                                            onChange={(e) => setData('email_on_message', e.target.checked)}
                                            id="email_on_message"
                                        />
                                        <label className="form-check-label" htmlFor="email_on_message">
                                            Tölvupóstur þegar skilaboð berast
                                        </label>
                                    </div>

                                    <div className="form-check form-switch mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.email_on_notifications}
                                            onChange={(e) => setData('email_on_notifications', e.target.checked)}
                                            id="email_on_notifications"
                                        />
                                        <label className="form-check-label" htmlFor="email_on_notifications">
                                            Almennar tilkynningar
                                        </label>
                                    </div>

                                    <div className="form-check form-switch mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.email_on_system}
                                            onChange={(e) => setData('email_on_system', e.target.checked)}
                                            id="email_on_system"
                                        />
                                        <label className="form-check-label" htmlFor="email_on_system">
                                            Kerfisskilaboð
                                        </label>
                                    </div>

                                    <hr />

                                    <div className="form-check form-switch mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.email_on_ad_expiring}
                                            onChange={(e) => setData('email_on_ad_expiring', e.target.checked)}
                                            id="email_on_ad_expiring"
                                        />
                                        <label className="form-check-label" htmlFor="email_on_ad_expiring">
                                            Auglýsing að renna út
                                        </label>
                                    </div>

                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.email_on_ad_expired}
                                            onChange={(e) => setData('email_on_ad_expired', e.target.checked)}
                                            id="email_on_ad_expired"
                                        />
                                        <label className="form-check-label" htmlFor="email_on_ad_expired">
                                            Auglýsing útrunnin
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <TTButton type="submit" variant="blue" look="solid" disabled={processing}>
                                    {processing ? 'Vista...' : 'Vista'}
                                </TTButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

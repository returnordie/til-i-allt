import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import TTButton from '@/Components/UI/TTButton';
import { Head, useForm, usePage } from '@inertiajs/react';

type PageProps = { flash?: { success?: string } };

export default function Password() {
    const { props } = usePage<PageProps>();

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('account.security.password.update'), {
            preserveScroll: true,
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Öryggi" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h1 className="h4 mb-0">Öryggi</h1>
                            <div className="text-muted small">{recentlySuccessful ? 'Vistað.' : null}</div>
                        </div>

                        {props.flash?.success ? (
                            <div className="alert alert-success">{props.flash.success}</div>
                        ) : null}

                        <form onSubmit={submit}>
                            <div className="card">
                                <div className="card-body">
                                    <h2 className="h6 mb-3">Breyta lykilorði</h2>

                                    <div className="mb-3">
                                        <label className="form-label">Núverandi lykilorð</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.current_password ? 'is-invalid' : ''}`}
                                            value={data.current_password}
                                            onChange={(e) => setData('current_password', e.target.value)}
                                        />
                                        {errors.current_password ? (
                                            <div className="invalid-feedback">{errors.current_password}</div>
                                        ) : null}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Nýtt lykilorð</label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password ? <div className="invalid-feedback">{errors.password}</div> : null}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Staðfesta nýtt lykilorð</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-3">
                                <TTButton type="submit" variant="blue" look="solid" disabled={processing}>
                                    {processing ? 'Vista...' : 'Breyta lykilorði'}
                                </TTButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

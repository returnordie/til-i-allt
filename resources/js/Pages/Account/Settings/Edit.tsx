import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import TTButton from '@/Components/UI/TTButton';
import { Head, useForm, usePage } from '@inertiajs/react';

type UserSettings = {
    id: number;
    name: string;
    username: string | null;
    phone_e164: string | null;
    date_of_birth: string | null;
    tia_balance: number;

    show_name: boolean;
    show_phone: boolean;

    preferred_contact_method: 'message' | 'call' | 'any',
    best_call_time: string | null;
    contact_note: string | null;

    username_change_days: number;
    can_change_username: boolean;
    username_next_change_at: string;
};

type PageProps = {
    user: UserSettings;
    flash?: { success?: string };
};

export default function Edit() {
    const { props } = usePage<PageProps>();
    const u = props.user;

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: u.name ?? '',
        username: u.username ?? '',
        phone_e164: u.phone_e164 ?? '',
        date_of_birth: u.date_of_birth ?? '',

        show_name: !!u.show_name,
        show_phone: !!u.show_phone,

        preferred_contact_method: (u.preferred_contact_method ?? 'any') as 'message' | 'call' | 'any',
        best_call_time: u.best_call_time ?? '',
        contact_note: u.contact_note ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('account.settings.update'), { preserveScroll: true });
    };

    const nextChangeText = new Date(u.username_next_change_at).toLocaleString();

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Stillingar" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h1 className="h4 mb-0">Stillingar</h1>
                            <div className="text-muted small">{recentlySuccessful ? 'Vistað.' : null}</div>
                        </div>

                        {props.flash?.success ? (
                            <div className="alert alert-success">{props.flash.success}</div>
                        ) : null}

                        <form onSubmit={submit}>
                            {/* Basic */}
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h2 className="h6 mb-3">Upplýsingar</h2>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Nafn</label>
                                            <input
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name ? <div className="invalid-feedback">{errors.name}</div> : null}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Notandanafn</label>
                                            <input
                                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value.toLowerCase())}
                                                disabled={!u.can_change_username}
                                            />
                                            {errors.username ? (
                                                <div className="invalid-feedback">{errors.username}</div>
                                            ) : (
                                                <div className="form-text">
                                                    {u.can_change_username
                                                        ? `Þú getur breytt notendanafni (hámark 1x á ${u.username_change_days} daga fresti).`
                                                        : `Þú getur breytt notendanafni næst: ${nextChangeText}`}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Fæðingardagur</label>
                                            <input
                                                type="date"
                                                className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                            />
                                            {errors.date_of_birth ? (
                                                <div className="invalid-feedback">{errors.date_of_birth}</div>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Símanúmer (E.164)</label>
                                            <input
                                                className={`form-control ${errors.phone_e164 ? 'is-invalid' : ''}`}
                                                placeholder="+354..."
                                                value={data.phone_e164}
                                                onChange={(e) => setData('phone_e164', e.target.value)}
                                            />
                                            {errors.phone_e164 ? (
                                                <div className="invalid-feedback">{errors.phone_e164}</div>
                                            ) : (
                                                <div className="form-text">
                                                    Sími birtist ekki á notendasíðu. Sími birtist aðeins í virkum auglýsingum ef kveikt er á því í auglýsingu.
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">TIA stig</label>
                                            <input className="form-control" value={u.tia_balance} disabled />
                                            <div className="form-text">Stig fyrir virkni (read-only hér).</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Defaults for ads */}
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h2 className="h6 mb-3">Sjálfgefin atriði í nýjum auglýsingum</h2>

                                    <div className="form-check form-switch mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.show_name}
                                            onChange={(e) => setData('show_name', e.target.checked)}
                                            id="show_name"
                                        />
                                        <label className="form-check-label" htmlFor="show_name">
                                            Sýna nafn í auglýsingum (sjálfgefið)
                                        </label>
                                    </div>

                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={data.show_phone}
                                            onChange={(e) => setData('show_phone', e.target.checked)}
                                            id="show_phone"
                                        />
                                        <label className="form-check-label" htmlFor="show_phone">
                                            Sýna síma í auglýsingum (sjálfgefið)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Contact preferences */}
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h2 className="h6 mb-3">Hvernig er best að hafa samband?</h2>

                                    <div className="d-flex gap-3 flex-wrap mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="preferred_contact_method"
                                                id="pref_any"
                                                checked={data.preferred_contact_method === 'any'}
                                                onChange={() => setData('preferred_contact_method', 'any')}
                                            />
                                            <label className="form-check-label" htmlFor="pref_any">
                                                Skiptir ekki máli
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="preferred_contact_method"
                                                id="pref_message"
                                                checked={data.preferred_contact_method === 'message'}
                                                onChange={() => {
                                                    setData('preferred_contact_method', 'message');
                                                    setData('best_call_time', '');
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="pref_message">
                                                Skilaboð
                                            </label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="preferred_contact_method"
                                                id="pref_call"
                                                checked={data.preferred_contact_method === 'call'}
                                                onChange={() => setData('preferred_contact_method', 'call')}
                                            />
                                            <label className="form-check-label" htmlFor="pref_call">
                                                Símtal
                                            </label>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Best að hringja (t.d. 17–20)</label>
                                            <input
                                                className={`form-control ${errors.best_call_time ? 'is-invalid' : ''}`}
                                                value={data.best_call_time}
                                                onChange={(e) => setData('best_call_time', e.target.value)}
                                                disabled={data.preferred_contact_method === 'message'}
                                            />
                                            {errors.best_call_time ? (
                                                <div className="invalid-feedback">{errors.best_call_time}</div>
                                            ) : null}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">Athugasemd (valfrjálst)</label>
                                            <input
                                                className={`form-control ${errors.contact_note ? 'is-invalid' : ''}`}
                                                value={data.contact_note}
                                                onChange={(e) => setData('contact_note', e.target.value)}
                                                placeholder="t.d. Sendið frekar skilaboð á kvöldin"
                                            />
                                            {errors.contact_note ? (
                                                <div className="invalid-feedback">{errors.contact_note}</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {errors.preferred_contact_method ? (
                                        <div className="text-danger small mt-2">{errors.preferred_contact_method}</div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
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

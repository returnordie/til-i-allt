import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { Head, Link, router, usePage } from '@inertiajs/react';

type ConvRow = {
    id: number;
    status: string;
    context: string;
    subject: string | null;
    last_message_at: string | null;
    unread: boolean;
    snippet: string | null;
    other: { name: string; username: string | null } | null;
    ad: { title: string; link: string | null } | null;
    links: { show: string };
};

type PageProps = {
    filters: { filter: string; q: string };
    conversations: {
        data: ConvRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    flash?: { success?: string; error?: string };
};

function fmtTime(s: string | null) {
    if (!s) return '';
    return new Date(s).toLocaleString();
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { filters, conversations } = props;

    return (
        <AppLayout headerProps={{ hideCatbar: true }} mainClassName="bg-light">
            <Head title="Skilaboð" />

            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-lg-3">
                        <AccountNav />
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h1 className="h4 mb-0">Skilaboð</h1>
                        </div>

                        {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        <div className="card mb-3">
                            <div className="card-body">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {['inbox', 'archived', 'all'].map((k) => {
                                        const active = filters.filter === k;
                                        return (
                                            <button
                                                key={k}
                                                className={`btn btn-sm ${active ? 'btn-dark' : 'btn-outline-dark'}`}
                                                onClick={() =>
                                                    router.get(route('conversations.index'), { filter: k, q: filters.q }, { preserveState: true, preserveScroll: true })
                                                }
                                            >
                                                {k === 'inbox' ? 'Innhólf' : k === 'archived' ? 'Falin skilaboð' : 'Allt'}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="input-group">
                                    <span className="input-group-text">Leit</span>
                                    <input
                                        className="form-control"
                                        value={filters.q}
                                        onChange={(e) =>
                                            router.get(route('conversations.index'), { filter: filters.filter, q: e.target.value }, { preserveState: true, preserveScroll: true })
                                        }
                                        placeholder="Leita í subject..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="list-group list-group-flush">
                                {conversations.data.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={c.links.show}
                                        className={`list-group-item list-group-item-action ${c.unread ? 'fw-semibold' : ''}`}
                                    >
                                        <div className="d-flex justify-content-between gap-3">
                                            <div className="text-truncate">
                                                <div className="d-flex align-items-center gap-2">
                                                    {c.unread ? <span className="badge text-bg-danger">Nýtt</span> : null}
                                                    <span>{c.other?.name ?? '—'}</span>
                                                    <span className="text-muted small">{c.context === 'support' ? 'Support' : 'Auglýsing'}</span>
                                                </div>

                                                <div className="text-muted small text-truncate">
                                                    {c.ad?.title ? `„${c.ad.title}“ · ` : ''}
                                                    {c.snippet ?? ''}
                                                </div>
                                            </div>

                                            <div className="text-muted small text-nowrap">
                                                {fmtTime(c.last_message_at)}
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {conversations.data.length === 0 ? (
                                    <div className="list-group-item text-center text-muted py-5">Engin skilaboð.</div>
                                ) : null}
                            </div>
                        </div>

                        {conversations.links?.length ? (
                            <nav className="mt-3">
                                <ul className="pagination pagination-sm mb-0 flex-wrap">
                                    {conversations.links.map((l, idx) => (
                                        <li key={idx} className={`page-item ${l.active ? 'active' : ''} ${!l.url ? 'disabled' : ''}`}>
                                            {l.url ? (
                                                <Link className="page-link" href={l.url} preserveScroll>
                                                    <span dangerouslySetInnerHTML={{ __html: l.label }} />
                                                </Link>
                                            ) : (
                                                <span className="page-link">
                          <span dangerouslySetInnerHTML={{ __html: l.label }} />
                        </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import AppLayout from '@/Layouts/AppLayout';
import AccountNav from '@/Components/Account/AccountNav';
import { Head, Link, usePage } from '@inertiajs/react';

type N = {
    id: string;
    read_at: string | null;
    created_at: string | null;
    data: {
        kind: string;
        title: string;
        body: string | null;
        url: string | null;
    };
    links: {
        open: string;
    };
};

type PageProps = {
    notifications: {
        data: N[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    unreadCount: number;
    flash?: { success?: string; error?: string };
};

function fmtTime(s: string | null) {
    if (!s) return '';
    return new Date(s).toLocaleString();
}

export default function Inbox() {
    const { props } = usePage<PageProps>();
    const { notifications, unreadCount } = props;

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
                            <div>
                                <h1 className="h4 mb-0">Tilkynningar</h1>
                                <div className="text-muted small">Ólesið: {unreadCount}</div>
                            </div>
                        </div>

                        {props.flash?.success ? <div className="alert alert-success">{props.flash.success}</div> : null}
                        {props.flash?.error ? <div className="alert alert-danger">{props.flash.error}</div> : null}

                        <div className="card">
                            <div className="list-group list-group-flush">
                                {notifications.data.map((n) => {
                                    const unread = !n.read_at;
                                    return (
                                        <a
                                            key={n.id}
                                            href={n.links.open}
                                            className={`list-group-item list-group-item-action ${unread ? 'fw-semibold' : ''}`}
                                        >
                                            <div className="d-flex justify-content-between gap-3">
                                                <div className="text-truncate">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {unread ? <span className="badge text-bg-danger">Nýtt</span> : null}
                                                        <span>{n.data.title}</span>
                                                    </div>
                                                    {n.data.body ? (
                                                        <div className="text-muted small text-truncate">{n.data.body}</div>
                                                    ) : null}
                                                </div>
                                                <div className="text-muted small text-nowrap">{fmtTime(n.created_at)}</div>
                                            </div>
                                        </a>
                                    );
                                })}

                                {notifications.data.length === 0 ? (
                                    <div className="list-group-item text-center text-muted py-5">
                                        Engar tilkynningar.
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {notifications.links?.length ? (
                            <nav className="mt-3">
                                <ul className="pagination pagination-sm mb-0 flex-wrap">
                                    {notifications.links.map((l, idx) => (
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

import React, { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Header';

type AppLayoutProps = PropsWithChildren<{
    title?: string;
    centered?: boolean;
    container?: boolean;
    mainClassName?: string;
    headerProps?: {
        hideCatbar?: boolean;
        hideOffcanvasButtons?: boolean;
    };
}>;

export default function AppLayout({
                                      title,
                                      centered = false,
                                      container = false,
                                      mainClassName = '',
                                      headerProps,
                                      children,
                                  }: AppLayoutProps) {
    const content = centered ? (
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5">
                <div className="card shadow-sm">
                    <div className="card-body p-4">{children}</div>
                </div>
            </div>
        </div>
    ) : (
        children
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            {title ? <Head title={title} /> : null}

            <Header
                hideCatbar={headerProps?.hideCatbar ?? centered}
                hideOffcanvasButtons={headerProps?.hideOffcanvasButtons}
            />

            <main className={`flex-grow-1 ${mainClassName}`}>
                {container || centered ? <div className="container py-4">{content}</div> : content}
            </main>

            <footer className="border-top py-4 mt-5">
                <div className="container">
                    <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
                        <div className="text-muted small">© {new Date().getFullYear()} Til í allt</div>

                        <div className="d-flex gap-3 small">
                            <a className="text-decoration-none text-muted" href="/skilmalar">Skilmálar</a>
                            <a className="text-decoration-none text-muted" href="/personuvernd">Persónuvernd</a>
                            <a className="text-decoration-none text-muted" href="/kokur">Kökur</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

import { Link } from '@inertiajs/react';

export type PaginatorLink = { url: string | null; label: string; active: boolean };

function decodeLabel(label: string) {
    return label
        .replaceAll('&laquo;', '«')
        .replaceAll('&raquo;', '»')
        .replaceAll('&amp;', '&')
        .replaceAll('&hellip;', '…');
}

export default function Pagination({ links }: { links: PaginatorLink[] }) {
    if (!links || links.length <= 3) return null;

    return (
        <nav aria-label="Síður" className="mt-4">
            <ul className="pagination mb-0 flex-wrap tt-pagination-slate">
                {links.map((link, index) => {
                    const text = decodeLabel(link.label);
                    const isDisabled = !link.url;

                    return (
                        <li
                            key={`${text}-${index}`}
                            className={`page-item ${
                                isDisabled ? 'disabled' : ''
                            } ${link.active ? 'active' : ''}`}
                        >
                            {link.url ? (
                                <Link
                                    className="page-link"
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                >
                                    {text}
                                </Link>
                            ) : (
                                <span className="page-link">{text}</span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

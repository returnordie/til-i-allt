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
        <nav aria-label="Síður" className="mt-6">
            <ul className="flex flex-wrap gap-2">
                {links.map((link, index) => {
                    const text = decodeLabel(link.label);
                    const isDisabled = !link.url;

                    return (
                        <li key={`${text}-${index}`}>
                            {link.url ? (
                                <Link
                                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                                        link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                >
                                    {text}
                                </Link>
                            ) : (
                                <span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-400">
                                    {text}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

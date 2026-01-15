import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                `nav-link ${active ? 'active fw-semibold' : ''} ${className}`
            }
        >
            {children}
        </Link>
    );
}

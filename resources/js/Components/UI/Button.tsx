import React from 'react';
import { Link } from '@inertiajs/react';

type Variant = 'slate' | 'blue' | 'green' | 'teal' | 'amber' | 'red' | 'dark';
type Look = 'solid' | 'ghost' | 'outline' | 'soft';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
    variant?: Variant;
    look?: Look;
    size?: Size;
    className?: string;
    children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: 'button';
};

type ButtonAsLink = CommonProps & {
    as: 'link';
    href: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: Record<string, any>;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
};

function cx(...parts: Array<string | undefined | false>) {
    return parts.filter(Boolean).join(' ');
}

export default function TTButton(props: ButtonAsButton | ButtonAsLink) {
    const {
        variant = 'blue',
        look = 'solid',
        size = 'md',
        className,
        children,
        ...rest
    } = props as any;

    const classes = cx(
        'btn tt-btn',
        look === 'solid' && 'tt-solid',
        look === 'ghost' && 'tt-ghost',
        look === 'outline' && 'tt-outline',
        look === 'soft' && 'tt-soft',
        size === 'sm' && 'tt-sm',
        size === 'md' && 'tt-md',
        size === 'lg' && 'tt-lg',
        variant === 'slate' && 'tt-c-slate',
        variant === 'blue' && 'tt-c-blue',
        variant === 'green' && 'tt-c-green',
        variant === 'teal' && 'tt-c-teal',
        variant === 'amber' && 'tt-c-amber',
        variant === 'red' && 'tt-c-red',
        variant === 'dark' && 'tt-c-dark',
        className,
    );

    if ((props as ButtonAsLink).as === 'link') {
        const linkProps = rest as ButtonAsLink;
        const { href, ...linkRest } = linkProps;

        return (
            <Link href={href} className={classes} {...linkRest}>
                {children}
            </Link>
        );
    }

    const btnProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

    // Safety: if inside forms and not explicitly submit, default to type="button"
    const type = btnProps.type ?? 'button';

    return (
        <button {...btnProps} type={type} className={classes}>
            {children}
        </button>
    );
}

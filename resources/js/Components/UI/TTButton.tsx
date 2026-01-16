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

const TTButton = React.forwardRef<
    HTMLButtonElement | HTMLAnchorElement,
    ButtonAsButton | ButtonAsLink
>(function TTButton(props, ref) {
    const {
        variant = 'blue',
        look = 'solid',
        size = 'md',
        className,
        children,
        as,
        ...rest
    } = props as any;

    const classes = cx(
        'btn tt-btn',
        `tt-${look}`,
        `tt-${size}`,
        `tt-c-${variant}`,
        className,
    );

    const isLink = (props as ButtonAsLink).as === 'link' || 'href' in props;

    if (isLink) {
        const linkProps = rest as ButtonAsLink;
        const { href, ...linkRest } = linkProps;

        return (
            <Link
                ref={ref as React.ForwardedRef<HTMLAnchorElement>}
                href={href}
                className={classes}
                {...linkRest}
            >
                {children}
            </Link>
        );
    }

    const btnProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;

    const type = btnProps.type ?? 'button';

    return (
        <button
            {...btnProps}
            ref={ref as React.ForwardedRef<HTMLButtonElement>}
            type={type}
            className={classes}
        >
            {children}
        </button>
    );
});

TTButton.displayName = 'TTButton';

export default TTButton;

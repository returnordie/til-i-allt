import { ButtonHTMLAttributes } from 'react';
import TTButton from '@/Components/UI/TTButton';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <TTButton
            {...props}
            type={type}
            variant="slate"
            look="outline"
            className={`${disabled ? 'disabled' : ''} ${className}`.trim()}
            disabled={disabled}
        >
            {children}
        </TTButton>
    );
}

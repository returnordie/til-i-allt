import { ButtonHTMLAttributes } from 'react';
import TTButton from '@/Components/UI/TTButton';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <TTButton
            {...props}
            variant="red"
            look="solid"
            className={`${disabled ? 'disabled' : ''} ${className}`.trim()}
            disabled={disabled}
        >
            {children}
        </TTButton>
    );
}

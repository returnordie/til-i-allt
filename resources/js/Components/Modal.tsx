import { PropsWithChildren, RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    initialFocus,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    initialFocus?: RefObject<HTMLElement>;
    onClose: CallableFunction;
}>) {
    const modalRef = useRef<HTMLDivElement>(null);

    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
    }[maxWidth];

    useEffect(() => {
        if (!show) return;

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('keydown', handleKeydown);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [show, closeable, onClose]);

    useEffect(() => {
        if (!show) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [show]);

    useEffect(() => {
        if (!show) return;
        if (initialFocus?.current) {
            initialFocus.current.focus();
            return;
        }

        modalRef.current?.focus();
    }, [show, initialFocus]);

    if (!show) {
        return null;
    }

    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            id="modal"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    close();
                }
            }}
        >
            <div className="absolute inset-0 bg-gray-500/75" aria-hidden="true" />
            <div
                ref={modalRef}
                tabIndex={-1}
                className={`relative w-full transform overflow-hidden rounded-lg bg-white shadow-xl sm:mx-auto sm:w-full ${maxWidthClass}`}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}

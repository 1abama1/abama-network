import { useState, type ReactNode } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
                    <button className="btn-primary" onClick={onConfirm}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

export function useConfirmDialog() {
    const [state, setState] = useState<{ open: boolean; title: string; message: string; resolve: ((v: boolean) => void) | null }>({
        open: false, title: '', message: '', resolve: null,
    });

    const confirm = (title: string, message: string): Promise<boolean> => {
        return new Promise(resolve => {
            setState({ open: true, title, message, resolve });
        });
    };

    const handleConfirm = () => {
        state.resolve?.(true);
        setState(prev => ({ ...prev, open: false }));
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState(prev => ({ ...prev, open: false }));
    };

    return { confirm, dialogProps: { ...state, onConfirm: handleConfirm, onCancel: handleCancel } };
}

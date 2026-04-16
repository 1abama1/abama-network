import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import './ConfirmDialog.css';

type ConfirmType = 'info' | 'danger' | 'success';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    type?: ConfirmType;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function ConfirmDialog({
    open,
    title,
    message,
    type = 'info',
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel'
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="confirm-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                >
                    <motion.div
                        className={`confirm-card glass-card type-${type}`}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="confirm-icon-wrapper">
                            {type === 'danger' && <AlertTriangle size={32} />}
                            {type === 'info' && <Info size={32} />}
                            {type === 'success' && <CheckCircle size={32} />}
                        </div>
                        <h3>{title}</h3>
                        <p>{message}</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn btn-cancel-modern" onClick={onCancel}>
                                {cancelLabel}
                            </button>
                            <button className="confirm-btn btn-confirm-modern" onClick={onConfirm}>
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface ConfirmOptions {
    type?: ConfirmType;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function useConfirmDialog() {
    const [state, setState] = useState<{
        open: boolean;
        title: string;
        message: string;
        type: ConfirmType;
        confirmLabel?: string;
        cancelLabel?: string;
        resolve: ((v: boolean) => void) | null
    }>({
        open: false,
        title: '',
        message: '',
        type: 'info',
        resolve: null,
    });

    const confirm = (title: string, message: string, options?: ConfirmOptions): Promise<boolean> => {
        return new Promise(resolve => {
            setState({
                open: true,
                title,
                message,
                type: options?.type || 'info',
                confirmLabel: options?.confirmLabel,
                cancelLabel: options?.cancelLabel,
                resolve
            });
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

    return {
        confirm,
        dialogProps: {
            ...state,
            onConfirm: handleConfirm,
            onCancel: handleCancel
        }
    };
}

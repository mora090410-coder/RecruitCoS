import React, { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function Toast({
    message,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    onClose,
    duration = 5000
}) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-white/10 flex items-center gap-4 min-w-[320px]">
                <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                        {secondaryActionLabel && (
                            <button
                                onClick={() => {
                                    onSecondaryAction();
                                    onClose();
                                }}
                                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                {secondaryActionLabel}
                            </button>
                        )}
                        {actionLabel && (
                            <button
                                onClick={() => {
                                    onAction();
                                    onClose();
                                }}
                                className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                            >
                                {actionLabel}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors ml-1"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}

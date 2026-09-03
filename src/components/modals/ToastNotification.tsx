import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#1b1b1b] text-white p-4 rounded-xl shadow-xl border border-neutral-700 flex items-start gap-3 animate-slide-in transition-all"
        >
          <span className="material-symbols-outlined text-[#e3e2e2] text-xl mt-0.5">
            {toast.type === 'success'
              ? 'check_circle'
              : toast.type === 'warning'
              ? 'warning'
              : toast.type === 'error'
              ? 'error'
              : 'info'}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-white">{toast.title}</h4>
            {toast.message && <p className="text-xs text-neutral-300 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};

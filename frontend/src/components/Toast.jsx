import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const tones = {
  success: {
    wrap: 'border-emerald-200 bg-white text-slate-800',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    wrap: 'border-rose-200 bg-white text-slate-800',
    icon: 'text-rose-600',
    Icon: AlertCircle,
  },
  info: {
    wrap: 'border-indigo-200 bg-white text-slate-800',
    icon: 'text-indigo-600',
    Icon: Info,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
        {toasts.map(({ id, message, tone }) => {
          const config = tones[tone] || tones.info;
          const Icon = config.Icon;
          return (
            <div
              key={id}
              className={`animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-lg shadow-slate-900/10 ${config.wrap}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.icon}`} />
              <p className="flex-1 text-xs font-semibold leading-relaxed">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}

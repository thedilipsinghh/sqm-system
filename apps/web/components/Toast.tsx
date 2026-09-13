"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = "info", title, message, duration = 4000 }: { type?: ToastType; title: string; message?: string; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast({ type: "error", title, message }), [toast]);
  const info = useCallback((title: string, message?: string) => toast({ type: "info", title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Global Toast Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-slideUp flex items-start gap-3 text-left ${
              t.type === "success"
                ? "bg-secondary-fixed/95 text-secondary border-secondary/30 shadow-secondary/10"
                : t.type === "error"
                ? "bg-error-container/95 text-on-error-container border-error/30 shadow-error/10"
                : t.type === "warning"
                ? "bg-tertiary-container/95 text-on-tertiary-container border-tertiary/30 shadow-tertiary/10"
                : "bg-surface-container-lowest/95 text-on-surface border-outline-variant/40 shadow-black/10"
            }`}
          >
            <span
              className={`material-symbols-outlined shrink-0 text-[22px] mt-0.5 ${
                t.type === "success"
                  ? "text-secondary"
                  : t.type === "error"
                  ? "text-error"
                  : t.type === "warning"
                  ? "text-tertiary"
                  : "text-primary"
              }`}
            >
              {t.type === "success"
                ? "check_circle"
                : t.type === "error"
                ? "error"
                : t.type === "warning"
                ? "warning"
                : "info"}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-label-ui font-bold text-[14px] leading-tight tracking-wide">{t.title}</p>
              {t.message && <p className="font-body-sm text-body-sm mt-1 opacity-90 leading-snug break-words">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-outline hover:text-on-surface rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

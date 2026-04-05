import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = "error") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const ms = variant === "success" ? 3500 : 5500;
      setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-auto md:top-4 md:items-end md:pb-4 md:pr-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg motion-reduce:animate-none animate-fade-in ${
              t.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100"
                : "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100"
            }`}
          >
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
              aria-label="Dismiss"
            >
              ù
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

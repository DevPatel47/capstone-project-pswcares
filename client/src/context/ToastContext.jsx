import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

let idCounter = 0;

const TOAST_STYLES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutMapRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }

    setToasts((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${idCounter}`;
      idCounter += 1;

      setToasts((previous) => [...previous, { id, message, type }]);

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, 3500);

      timeoutMapRef.current.set(id, timeoutId);
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      for (const timeoutId of timeoutMapRef.current.values()) {
        window.clearTimeout(timeoutId);
      }

      timeoutMapRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => pushToast(message, "success"),
      error: (message) => pushToast(message, "error"),
      info: (message) => pushToast(message, "info"),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.message}</p>
              <button
                aria-label="Dismiss notification"
                className="rounded px-1 text-xs opacity-70 transition hover:opacity-100"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                X
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};

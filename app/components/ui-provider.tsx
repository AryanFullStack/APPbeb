"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Icon } from "./ui-icon";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: { title?: string; message: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, type = "info", duration = 4000 }: { title?: string; message: string; type?: ToastType; duration?: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, message, type, duration };
      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => toast({ message, title, type: "success" }), [toast]);
  const error = useCallback((message: string, title?: string) => toast({ message, title, type: "error" }), [toast]);
  const info = useCallback((message: string, title?: string) => toast({ message, title, type: "info" }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="toast-container"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`toast toast-${item.type || "info"}`}
            role="status"
          >
            <div className="toast-icon">
              {item.type === "success" && <Icon name="check-circle" size={17} />}
              {item.type === "error" && <Icon name="x" size={17} />}
              {item.type === "warning" && <Icon name="info" size={17} />}
              {(!item.type || item.type === "info") && <Icon name="info" size={17} />}
            </div>
            <div className="toast-body">
              {item.title && <div className="toast-title">{item.title}</div>}
              <div className="toast-message">{item.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Close notification"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

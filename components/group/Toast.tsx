"use client";

import type { Toast as ToastType } from "./useToasts";

interface ToastContainerProps {
  toasts: ToastType[];
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "72px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        pointerEvents: "none",
        width: "100%",
        maxWidth: "340px",
        padding: "0 16px",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="font-sans"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--t1)",
            opacity: toast.exiting ? 0 : 1,
            transform: toast.exiting ? "translateY(-8px)" : "translateY(0)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            animation: toast.exiting ? "none" : "toastIn 0.3s ease",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: toast.accent,
              flexShrink: 0,
            }}
          />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

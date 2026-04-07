"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Toast {
  id: string;
  message: string;
  accent: string;
  exiting: boolean;
}

const TOAST_DURATION = 3000;
const FADE_DURATION = 400;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMap = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear all pending timers on unmount
  useEffect(() => {
    const map = timerMap.current;
    return () => {
      for (const t of map.values()) clearTimeout(t);
      map.clear();
    };
  }, []);

  const addToast = useCallback((message: string, accent = "var(--teal)") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setToasts((prev) => {
      const next = [...prev, { id, message, accent, exiting: false }];
      // Keep max 3 toasts visible
      if (next.length > 3) return next.slice(-3);
      return next;
    });

    const exitTimer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );

      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timerMap.current.delete(id);
      }, FADE_DURATION);

      timerMap.current.set(`${id}-remove`, removeTimer);
    }, TOAST_DURATION);

    timerMap.current.set(id, exitTimer);
  }, []);

  return { toasts, addToast };
}

"use client";

import { useState, useCallback } from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

let listeners: ((toasts: Toast[]) => void)[] = [];
let toastState: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toastState]));
}

export function toast(t: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastState = [...toastState, { ...t, id }];
  notify();
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const subscribe = useCallback((fn: (toasts: Toast[]) => void) => {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  useState(() => {
    const unsub = subscribe(setToasts);
    return unsub;
  });

  function dismiss(id: string) {
    toastState = toastState.filter((t) => t.id !== id);
    notify();
  }

  return { toasts, dismiss };
}

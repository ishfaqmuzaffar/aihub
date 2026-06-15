"use client";

import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-4 rounded-xl border bg-card shadow-lg animate-in slide-in-from-right-full"
        >
          <div className="flex-1">
            {toast.title && <p className="text-sm font-medium">{toast.title}</p>}
            {toast.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

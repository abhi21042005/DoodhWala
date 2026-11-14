'use client';

// toast notification system backed by zustand store
// see stores/uiStore.js for the zustand side

import { useUiStore } from '@/stores/uiStore';
import { useEffect } from 'react';

export default function Toast() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: 'bg-green-light border-green-mid text-green-deep',
    error: 'bg-red-light border-red-soft text-red-soft',
    info: 'bg-blue-milk-light border-blue-milk text-gray-700',
  };

  return (
    <div
      role="status"
      className={`px-4 py-3 rounded-lg border shadow-sm text-sm ${colors[toast.type] || colors.info}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p>{toast.message}</p>
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 text-xs" aria-label="Dismiss">
          x
        </button>
      </div>
    </div>
  );
}

'use client';

// modal component using dialog element
// lazy loaded in Phase 7

import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/40 rounded-xl border border-gray-200 shadow-lg p-0 max-w-lg w-full mx-auto"
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-serif text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

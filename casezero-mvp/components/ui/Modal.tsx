"use client";

import { useId, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-lg font-bold text-gray-900">
            {title}
          </h3>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

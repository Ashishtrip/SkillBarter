"use client";

import React from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  action?: { label: string; onClick: () => void };
};

export default function Toast({ message, type = 'info', onClose, action }: ToastProps) {
  return (
    <div className={`fixed right-6 bottom-6 z-50 rounded shadow px-4 py-2 flex items-center gap-3 ${type === 'error' ? 'bg-red-600 text-white' : type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`} role="status">
      <div className="flex-1 text-sm">{message}</div>
      {action && (
        <button onClick={action.onClick} className="underline text-sm opacity-90">{action.label}</button>
      )}
      <button onClick={onClose} aria-label="dismiss" className="ml-2 text-sm opacity-80">✕</button>
    </div>
  );
}

'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: <AlertTriangle className="text-error" size={24} />,
      bg: 'bg-error-container/10',
      btn: 'bg-error text-white hover:bg-error/90 shadow-error/20'
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      bg: 'bg-amber-50',
      btn: 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20'
    },
    info: {
      icon: <AlertTriangle className="text-primary-container" size={24} />,
      bg: 'bg-primary-container/10',
      btn: 'bg-primary-container text-white hover:bg-primary-container/90 shadow-primary-container/20'
    }
  };

  const current = variants[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-lowest rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={`w-12 h-12 ${current.bg} rounded-2xl flex items-center justify-center`}>
              {current.icon}
            </div>
            <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X size={20} />
            </button>
          </div>

          <h3 className="text-lg font-black text-on-surface uppercase tracking-widest mb-2">{title}</h3>
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed mb-8">{message}</p>

          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 h-12 bg-surface-container-low text-on-surface font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-surface-container transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 h-12 ${current.btn} font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

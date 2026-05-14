'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  title?: string;
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ title, message, type = 'success', onClose }) => {
 const config = {
 success: {
 bg: 'bg-green-50',
 border: 'border-green-100',
 text: 'text-green-800',
 icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
 },
 error: {
 bg: 'bg-red-50',
 border: 'border-red-100',
 text: 'text-red-800',
 icon: <AlertCircle className="w-5 h-5 text-red-600" />
 },
 info: {
 bg: 'bg-surface-container-low',
 border: 'border-outline-variant',
 text: 'text-on-surface',
 icon: <Info className="w-5 h-5 text-tertiary" />
 }
 };

 const { bg, border, text, icon } = config[type];

 return (
 <div 
 className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${border} ${text} shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-[calc(100vw-32px)] sm:w-auto`}
 role="alert"
 >
  <div className="flex-shrink-0">{icon}</div>
  <div className="flex-1 space-y-1">
    {title && <h5 className="text-xs font-semibold uppercase tracking-widest">{title}</h5>}
    <p className="text-[11px] font-medium leading-relaxed opacity-90">{message}</p>
  </div>
 <button 
 onClick={onClose}
 className="flex-shrink-0 hover:opacity-70 transition-opacity p-1"
 aria-label="Close notification"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 );
};

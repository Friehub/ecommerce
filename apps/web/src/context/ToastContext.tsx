'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toast: (options: { title?: string; message?: string; description?: string; type?: ToastType; variant?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<{ title?: string; message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setCurrentToast({ message, type });
    setTimeout(() => setCurrentToast(null), 4000);
  }, []);

  const toast = useCallback((options: { title?: string; message?: string; description?: string; type?: ToastType; variant?: string }) => {
    setCurrentToast({ 
      title: options.title, 
      message: options.message || options.description || '', 
      type: (options.type || (options.variant === 'destructive' ? 'error' : 'success')) as ToastType 
    });
    setTimeout(() => setCurrentToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {currentToast && (
        <Toast 
          title={currentToast.title}
          message={currentToast.message} 
          type={currentToast.type} 
          onClose={() => setCurrentToast(null)} 
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
 const context = useContext(ToastContext);
 if (context === undefined) {
 throw new Error('useToast must be used within a ToastProvider');
 }
 return context;
};

// apps/web/src/app/error.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Error boundary caught:', error);
  }, [error]);

  return (
    <div className="bg-j-background min-h-screen flex items-center justify-center px-6 py-24 select-none">
      <div className="max-w-md w-full bg-white border border-j-border shadow-lg p-10 rounded-sm text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-j-error rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm animate-bounce">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-j-text uppercase tracking-tight">Something Went Wrong</h1>
          <p className="text-[11px] text-j-text-muted uppercase font-black tracking-widest leading-relaxed">
            An unexpected error occurred while executing the transaction pipeline.
          </p>
        </div>
        
        {error.message && (
          <div className="bg-j-background p-4 rounded-sm border border-j-border text-left overflow-x-auto max-h-32 custom-scrollbar">
            <code className="text-[10px] font-mono text-j-text-muted break-all">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="flex-1 h-12 bg-jumia-orange text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 shadow transition-all active:scale-95"
          >
            <RotateCcw size={14} /> Retry Load
          </button>
          <Link
            href="/"
            className="flex-1 h-12 border border-j-border text-j-text bg-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-j-background transition-colors active:scale-95"
          >
            <Home size={14} /> Home Node
          </Link>
        </div>
      </div>
    </div>
  );
}

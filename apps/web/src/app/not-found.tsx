// apps/web/src/app/not-found.tsx
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="bg-j-background min-h-screen flex items-center justify-center px-6 py-24 select-none">
      <div className="max-w-md w-full bg-white border border-j-border shadow-lg p-10 rounded-sm text-center space-y-6">
        <div className="w-16 h-16 bg-orange-50 text-jumia-orange rounded-full flex items-center justify-center mx-auto border border-orange-100 shadow-sm animate-pulse">
          <ShoppingBag size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-j-text uppercase tracking-tight">Page Not Found</h1>
          <p className="text-[11px] text-j-text-muted uppercase font-black tracking-widest leading-relaxed">
            The specific catalog item or route node you are querying is currently unavailable or has been archived.
          </p>
        </div>

        <Link
          href="/"
          className="w-full h-12 bg-jumia-orange text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 shadow transition-all active:scale-95 inline-flex"
        >
          Explore Catalog <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

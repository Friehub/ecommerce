// apps/web/src/app/(buyer)/best-sellers/page.tsx
import React, { Suspense } from 'react';
import BestSellersClient from './BestSellersClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Sellers - Shop Top Products Online | Jumia Nigeria',
  description: 'Shop our daily updated list of bestselling products on Jumia Nigeria. Enjoy premium quality, best deals, and priority delivery services.',
};

export default function BestSellersPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-j-background min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-jumia-orange/20 border-t-jumia-orange rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-wider text-j-text-muted animate-pulse">Loading Bestsellers...</p>
          </div>
        </div>
      }
    >
      <BestSellersClient />
    </Suspense>
  );
}

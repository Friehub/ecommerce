// apps/web/src/app/(buyer)/jumia-express/page.tsx
import React, { Suspense } from 'react';
import JumiaExpressClient from './JumiaExpressClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jumia Express - Fast & Reliable Delivery | Jumia Nigeria',
  description: 'Shop Jumia Express products for the fastest delivery times, verified quality check, and guaranteed fulfillment within 24 hours.',
};

export default function JumiaExpressPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
            <p className="text-[10px] font-semibold uppercase text-on-surface-variant opacity-40 animate-pulse">Syncing Local Warehouses</p>
          </div>
        </div>
      }
    >
      <JumiaExpressClient />
    </Suspense>
  );
}

// apps/web/src/app/(buyer)/jumia-global/page.tsx
import React, { Suspense } from 'react';
import JumiaGlobalClient from './JumiaGlobalClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jumia Global - International Products Online | Jumia Nigeria',
  description: 'Shop dynamic catalog of global products from international sellers on Jumia Nigeria. Enjoy premium customs clearance handling and fast air shipping.',
};

export default function JumiaGlobalPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
            <p className="text-[10px] font-semibold uppercase text-on-surface-variant opacity-40 animate-pulse">Establishing Trans-Atlantic Link</p>
          </div>
        </div>
      }
    >
      <JumiaGlobalClient />
    </Suspense>
  );
}

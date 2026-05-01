'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '@/trpc/react';
import { Zap } from 'lucide-react';

export const FlashSales = () => {
  const { data: products, isLoading } = api.catalog.listProducts.useQuery({});

  if (isLoading) {
    return (
      <section className="container mt-6">
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[#DF3131] h-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter for products that have a discount for flash sales (mock)
  const flashProducts = products?.results?.slice(0, 6) || [];

  return (
    <section className="container mt-6">
      <div className="bg-white rounded shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#DF3131] h-12 flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <Zap size={20} fill="white" />
            <h2 className="font-bold uppercase tracking-tight">Flash Sales</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline">Time Left: 08h : 22m : 45s</span>
            <button className="text-xs font-bold hover:underline">SEE ALL &gt;</button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {flashProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .mt-6 { margin-top: 1.5rem; }
        .bg-white { background-color: #ffffff; }
        .bg-\[#DF3131\] { background-color: #df3131; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .rounded { border-radius: 4px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .overflow-hidden { overflow: hidden; }
        .h-12 { height: 3rem; }
        .p-4 { padding: 1rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .text-white { color: #ffffff; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-tight { letter-spacing: -0.025em; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @media (min-width: 768px) {
          .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }
        .hidden { display: none; }
        @media (min-width: 640px) {
          .sm\:inline { display: inline; }
        }
      `}</style>
    </section>
  );
};

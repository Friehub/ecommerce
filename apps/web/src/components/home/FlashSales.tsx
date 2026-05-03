'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '@/trpc/react';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime }: { endTime: any }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00h : 00m : 00s');
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <span>{timeLeft || '00h : 00m : 00s'}</span>;
};

export const FlashSales = () => {
  const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

  if (isLoading) {
    return (
      <section className="container mt-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-red-600 to-red-500 h-12 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return null;
  }

  // Convert flash sales into product items with specific flash prices
  const flashProducts = flashSales.slice(0, 6).map((fs: any) => {
    const p = { ...fs.variant.product };
    p.variants = [
      {
        ...fs.variant,
        price: parseFloat(fs.salePrice),
        comparePrice: parseFloat(fs.variant.price)
      }
    ];
    return p;
  });

  const earliestEnd = flashSales.reduce((prev: Date, curr: any) => {
    const d = new Date(curr.endTime);
    return !prev || d < prev ? d : prev;
  }, new Date(flashSales[0].endTime));

  return (
    <section className="container mt-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-red-600 h-14 flex items-center justify-between px-5 text-white">
          <div className="flex items-center gap-3">
            <Zap size={22} className="text-yellow-400" style={{ fill: 'currentColor' }} />
            <h2 className="font-bold uppercase tracking-tight text-white text-base md:text-lg">
              Flash Sales
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-sm font-bold bg-red-700/60 px-3 py-1.5 rounded hidden sm:inline-flex items-center gap-2">
              <span className="text-red-100 font-medium">Ends in:</span>
              <CountdownTimer endTime={earliestEnd} />
            </div>
            <a href="/flash-sales" className="text-xs font-bold hover:underline uppercase tracking-wide bg-red-700 hover:bg-red-800 transition-all px-3 py-1.5 rounded">
              See All
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5 bg-white">
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
        .bg-gray-50 { background-color: #f9fafb; }
        .rounded-xl { border-radius: 12px; }
        .rounded-lg { border-radius: 8px; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .overflow-hidden { overflow: hidden; }
        .p-5 { padding: 1.25rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-5 { gap: 20px; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .text-white { color: #ffffff; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .font-extrabold { font-weight: 800; }
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
          .sm\:inline-flex { display: inline-flex; }
        }
      `}</style>
    </section>
  );
};

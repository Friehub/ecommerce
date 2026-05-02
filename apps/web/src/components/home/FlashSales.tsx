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
      <div className="bg-white rounded shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#DF3131] h-12 flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <Zap size={20} fill="white" />
            <h2 className="font-bold uppercase tracking-tight">Flash Sales</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:inline">
              Time Left: <CountdownTimer endTime={earliestEnd} />
            </div>
            <a href="/flash-sales" className="text-xs font-bold hover:underline">SEE ALL &gt;</a>
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

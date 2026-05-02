'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { Zap, ChevronRight } from 'lucide-react';

const CountdownTimer = ({ endTime }: { endTime: any }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('00 : 00 : 00');
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, '0')} : ${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <span>{timeLeft || '00 : 00 : 00'}</span>;
};

export default function FlashSalesPage() {
  const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

  // Convert flash sales into product items with specific flash prices
  const flashProducts = flashSales?.map((fs: any) => {
    const p = { ...fs.variant.product };
    p.variants = [
      {
        ...fs.variant,
        price: parseFloat(fs.salePrice),
        comparePrice: parseFloat(fs.variant.price)
      }
    ];
    return p;
  }) || [];

  const earliestEnd = flashSales?.reduce((prev: Date, curr: any) => {
    const d = new Date(curr.endTime);
    return !prev || d < prev ? d : prev;
  }, flashSales?.[0] ? new Date(flashSales[0].endTime) : new Date());

  return (
    <div className="bg-[#F5F5F5] min-h-screen pb-12">
      <div className="container py-4">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/" className="text-gray-500 hover:text-[#F68B1E] transition-colors text-xs">Home</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-900">Flash Sales</span>
        </div>

        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[#E61601] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={24} fill="white" />
              <h1 className="text-xl font-bold uppercase italic tracking-tight">Flash Sales</h1>
            </div>
            {flashSales && flashSales.length > 0 && (
              <div className="flex items-center gap-2 font-bold">
                <span className="text-sm">TIME LEFT:</span>
                <div className="flex gap-1 bg-white text-black px-3 py-1.5 rounded text-sm font-mono tracking-wider">
                  <CountdownTimer endTime={earliestEnd} />
                </div>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded" />
              ))}
            </div>
          ) : flashProducts.length > 0 ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {flashProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={40} className="text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">No Flash Sales active right now</h2>
              <p className="text-gray-500 mt-2 mb-8">Check back soon for amazing deals!</p>
              <Link href="/" className="px-8 py-3 bg-[#F68B1E] text-white rounded font-bold uppercase hover:bg-[#E07A1A] transition-colors">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>


      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .bg-white { background-color: #ffffff; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .p-20 { padding: 5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .italic { font-style: italic; }
        .tracking-tight { letter-spacing: -0.025em; }
        .text-gray-900 { color: #111827; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-white { color: #ffffff; }
        .text-black { color: #000000; }
      `}</style>
    </div>
  );
}

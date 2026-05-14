// apps/web/src/components/home/FlashSales.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '@/trpc/react';
import { Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '../ui/Skeleton';

const CountdownTimer = ({ endTime }: { endTime: any }) => {
  const [timeLeft, setTimeLeft] = useState<{h: string, m: string, s: string}>({h: '00', m: '00', s: '00'});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({h: '00', m: '00', s: '00'});
        clearInterval(timer);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          h: String(hours).padStart(2, '0'),
          m: String(minutes).padStart(2, '0'),
          s: String(seconds).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="bg-white text-red-600 px-2 py-1 rounded font-bold text-xs">
      {timeLeft.h}h : {timeLeft.m}m : {timeLeft.s}s
    </div>
  );
};

export const FlashSales = () => {
  const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

  if (isLoading) {
    return (
      <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant overflow-hidden">
        <div className="bg-red-600 h-12 w-full animate-pulse" />
        <div className="p-4 flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="min-w-[180px] h-[240px] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!flashSales || flashSales.length === 0) return null;

  const earliestEnd = flashSales.reduce((prev: Date, curr: any) => {
    const d = new Date(curr.endTime);
    return !prev || d < prev ? d : prev;
  }, new Date(flashSales[0].endTime));

  return (
    <section className="bg-j-surface-container-lowest rounded border border-j-outline-variant overflow-hidden">
      {/* Header */}
      <div className="bg-red-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Zap size={20} className="fill-white" />
          <h3 className="text-headline-sm font-bold">Flash Sales</h3>
        </div>
        <div className="flex items-center gap-2 text-label-bold font-bold">
          <span className="hidden sm:inline uppercase">Time Left:</span>
          <CountdownTimer endTime={earliestEnd} />
        </div>
        <Link href="/flash-sales" className="text-label-bold font-bold hover:underline uppercase text-xs">
          See All &gt;
        </Link>
      </div>

      {/* Product List */}
      <div className="p-4 flex gap-4 overflow-x-auto snap-x hide-scrollbar">
        {flashSales.map((fs: any) => (
          <div key={fs.id} className="min-w-[180px] w-[180px] flex-shrink-0 snap-start">
            <ProductCard 
              product={{
                ...fs.variant.product,
                price: parseFloat(fs.salePrice),
                originalPrice: parseFloat(fs.variant.price),
                inventory: fs.limit - fs.sold
              }} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};

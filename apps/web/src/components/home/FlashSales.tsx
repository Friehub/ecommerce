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
    <div className="flex gap-1.5 items-center">
      <div className="bg-white text-red-600 px-1.5 py-1 rounded-sm font-black text-xs min-w-[28px] text-center">{timeLeft.h}</div>
      <span className="text-white font-black">:</span>
      <div className="bg-white text-red-600 px-1.5 py-1 rounded-sm font-black text-xs min-w-[28px] text-center">{timeLeft.m}</div>
      <span className="text-white font-black">:</span>
      <div className="bg-white text-red-600 px-1.5 py-1 rounded-sm font-black text-xs min-w-[28px] text-center">{timeLeft.s}</div>
    </div>
  );
};

export const FlashSales = () => {
  const { data: flashSales, isLoading } = api.promo.getFlashSales.useQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-sm border border-j-border overflow-hidden mt-8">
        <div className="bg-red-600 h-14 w-full animate-pulse" />
        <div className="p-4 flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="min-w-[200px] h-[300px] rounded-sm" />
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
    <section className="bg-white rounded-sm border border-j-border overflow-hidden mt-8 shadow-sm group">
      {/* Header */}
      <div className="bg-red-600 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-white gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Zap size={24} className="fill-white text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Flash <span className="text-white/80">Sales</span></h3>
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Top Deals. Limited Time.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/90">Ends in:</span>
            <CountdownTimer endTime={earliestEnd} />
          </div>
          <Link href="/flash-sales" className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:bg-white/10 px-4 py-2 rounded-sm transition-colors border border-white/20">
            See All <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 md:p-6 flex gap-6 overflow-x-auto snap-x hide-scrollbar scroll-smooth">
        {flashSales.map((fs: any) => (
          <div key={fs.id} className="min-w-[200px] w-[200px] flex-shrink-0 snap-start">
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

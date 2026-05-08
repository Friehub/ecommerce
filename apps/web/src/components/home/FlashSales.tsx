'use client';

import React from 'react';
import { ProductCard } from '../ui/ProductCard';
import { api } from '../../trpc/react';
import { Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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
    p.isFlashSale = true;
    p.itemsLeft = fs.limit - fs.sold; // Calculate from data
    return p;
  });

  const earliestEnd = flashSales.reduce((prev: Date, curr: any) => {
    const d = new Date(curr.endTime);
    return !prev || d < prev ? d : prev;
  }, new Date(flashSales[0].endTime));

  return (
    <section className="bg-surface-container rounded-xl overflow-hidden shadow-sm mt-stack-md">
      <div className="bg-error text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Zap size={24} className="fill-white" />
          <h2 className="font-inter text-xl font-bold uppercase tracking-wide">Flash Sales</h2>
          <div className="hidden md:flex items-center gap-2 ml-4">
            <span className="text-sm font-medium">Time Left:</span>
            <div className="bg-white text-error font-bold px-2 py-1 rounded">
              <CountdownTimer endTime={earliestEnd} />
            </div>
          </div>
        </div>
        <Link href="/flash-sales" className="font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-widest">
          SEE ALL <ChevronRight size={18} />
        </Link>
      </div>
      <div className="p-4 overflow-x-auto flex gap-4 hide-scrollbar">
        {flashProducts.map((product: any) => (
          <div key={product.id} className="min-w-[200px] md:min-w-[240px] bg-white rounded-lg p-3 group transition-all hover:shadow-md border border-outline-variant/20">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

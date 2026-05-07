'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';

export default function BestSellersPage() {
  const { data, isLoading } = api.catalog.listProducts.useQuery({
    limit: 20,
    sortBy: 'popularity' // Ensuring we show most popular items
  });

  if (isLoading) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen">
        <div className="container py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Calculating Trends...
        </div>
      </div>
    );
  }

  const products = data?.results || [];

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20 select-none">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#F68B1E] to-[#E07A1A] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <Zap size={16} className="text-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Lightning Fast</span>
               </div>
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <Truck size={16} className="text-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Local Warehouse</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
              Best <br />
              <span className="text-black/20">Sellers</span>
            </h1>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-lg mb-8">
              The products everyone is talking about. Hand-picked based on real-time sales data and customer satisfaction.
            </p>
            <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-black/5 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={14} className="text-[#FF7A00]" />
              <span className="text-gray-600">Updated Hourly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Top Trending Now</h2>
            <p className="text-sm text-gray-500 font-medium">Most purchased items in the last 24 hours.</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>{products.length} Items listed</span>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product: any, index: number) => (
              <div key={product.id} className="relative group">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#F68B1E] text-white rounded-full flex items-center justify-center font-black text-xs z-30 shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-50 p-24 text-center">
            <TrendingUp className="mx-auto text-gray-100 mb-8" size={64} />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Finding the Heat</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-medium italic">We're crunching the numbers to find today's top sellers. Come back in a few minutes!</p>
            <Link href="/" className="inline-block px-12 py-4 bg-[#F68B1E] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1A1A1A] transition-all transform active:scale-95 shadow-xl shadow-orange-500/10">
              Explore All Products
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
      `}</style>
    </div>
  );
}

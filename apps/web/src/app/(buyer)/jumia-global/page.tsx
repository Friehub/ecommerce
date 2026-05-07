'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ChevronRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';

export default function JumiaGlobalPage() {
  const { data, isLoading } = api.catalog.listProducts.useQuery({
    limit: 20,
    sortBy: 'newest',
    isGlobal: true // Filter for international products
  });

  if (isLoading) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen">
        <div className="container py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Connecting to Global Warehouses...
        </div>
      </div>
    );
  }

  const products = data?.results || [];

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20 select-none">
      {/* Hero Header */}
      <div className="bg-[#0D47A1] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D47A1] to-transparent opacity-80 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200')] bg-cover bg-center" />
        
        <div className="container relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#2196F3] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Globe size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">World's Best Brands</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
              Jumia <span className="text-[#F68B1E]">Global</span>
            </h1>
            <p className="text-sm md:text-base text-blue-50 font-medium leading-relaxed max-w-lg mb-8">
              Discover millions of products from international sellers. Shipped from abroad directly to your doorstep with guaranteed delivery.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <Globe size={16} className="text-[#2196F3]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">International Shipping</span>
               </div>
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <ShieldCheck size={16} className="text-[#2196F3]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Genuine Products</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">International Favorites</h2>
            <p className="text-sm text-gray-500 font-medium">Top picks from around the world.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>{products.length} Products found</span>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-50 p-24 text-center">
            <Globe className="mx-auto text-gray-100 mb-8" size={64} />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Global Shipping Paused</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-medium italic">We're currently updating our international inventory. Check back soon for new arrivals!</p>
            <Link href="/" className="inline-block px-12 py-4 bg-[#0D47A1] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F68B1E] transition-all transform active:scale-95 shadow-xl shadow-blue-500/10">
              Back to local shop
            </Link>
          </div>
        )}

        {/* Global Benefits */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Global Variety', desc: 'Millions of items from top sellers in China, Europe, and the USA.', icon: <Globe size={24} /> },
            { title: 'Safe Payments', desc: 'Secure local payment methods. Your money is held until delivery.', icon: <ShieldCheck size={24} /> },
            { title: 'Easy Returns', desc: 'Hassle-free local returns for most international products.', icon: <ShoppingBag size={24} /> }
          ].map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-50 shadow-lg shadow-black/[0.02]">
              <div className="text-[#0D47A1] mb-6">{benefit.icon}</div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">{benefit.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{benefit.desc}</p>
            </div>
          ))}
        </div>
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


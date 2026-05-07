'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../components/ui/ProductCard';

export default function JumiaExpressPage() {
  const { data, isLoading } = api.catalog.listProducts.useQuery({
    limit: 20,
    isExpress: true // Filter for fast-fulfillment products
  });

  if (isLoading) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen">
        <div className="container py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Scanning Local Hubs...
        </div>
      </div>
    );
  }

  const products = data?.results || [];

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20 select-none">
      {/* Hero Header */}
      <div className="bg-[#E91E63] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#880E4F] to-transparent opacity-80 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200')] bg-cover bg-center" />
        
        <div className="container relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/20">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-100">Same-Day Processing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
              Jumia <br />
              <span className="text-pink-300">Express</span>
            </h1>
            <p className="text-sm md:text-base text-pink-50 font-medium leading-relaxed max-w-lg mb-8">
              The fastest way to shop. Items stocked in our warehouse, quality checked, and shipped within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <Zap size={16} className="text-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Lightning Fast</span>
               </div>
               <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 transition-all hover:bg-white/10">
                 <Truck size={16} className="text-white" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Local Warehouse</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight italic">Ready to Ship</h2>
            <p className="text-sm text-gray-500 font-medium">Items currently available in our main fulfillment center.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>{products.length} Products ready</span>
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
            <Zap className="mx-auto text-gray-100 mb-8" size={64} />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Replenishing Stock</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-medium italic">Our trucks are on the way! We're stocking up on high-speed delivery items.</p>
            <Link href="/" className="inline-block px-12 py-4 bg-[#E91E63] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1A1A1A] transition-all transform active:scale-95 shadow-xl shadow-pink-500/10">
              Browse All Stores
            </Link>
          </div>
        )}

        {/* Express Benefits */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Warehouse Stocked', desc: 'No waiting for sellers to ship. Items are already in our hands.', icon: <Zap size={24} /> },
            { title: 'Priority Handling', desc: 'Jumia Express orders are processed first in our fulfillment line.', icon: <Truck size={24} /> },
            { title: 'Zero Defects', desc: 'Every Express item undergoes a multi-point quality check before storage.', icon: <ShieldCheck size={24} /> }
          ].map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-50 shadow-lg shadow-black/[0.02]">
              <div className="text-[#E91E63] mb-6">{benefit.icon}</div>
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

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '@/trpc/react';

export default function OfficialStoresPage() {
  const { data: brands, isLoading } = api.catalog.getBrands.useQuery();

  if (isLoading) {
    return (
      <div className="bg-[#F9F9FA] min-h-screen">
        <div className="container py-20 text-center text-gray-400 font-black uppercase tracking-widest text-[10px]">
          Curating Authentic Brands...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-20 select-none">
      {/* Hero Header */}
      <div className="bg-[#1A1A1A] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200')] bg-cover bg-center" />
        
        <div className="container relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-[#48A44C] p-1.5 rounded-lg shadow-lg shadow-green-500/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">100% Authentic Guarantee</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
              Official <br />
              <span className="text-[#F68B1E]">Brand Stores</span>
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-medium leading-relaxed max-w-lg mb-8">
              Shop directly from global manufacturers. Get exclusive access to the latest product launches and certified after-sales support.
            </p>
          </div>
        </div>
      </div>

      <div className="container -mt-12 relative z-30">
        <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-black/5 flex items-center gap-2 mb-12">
          <div className="flex-1 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100">
            {brands?.length || 0} Flagship Stores Available
          </div>
          <div className="px-4 py-2 flex items-center gap-4">
             {/* Simple filter chips could go here */}
             <span className="text-[10px] font-black uppercase text-[#F68B1E] bg-orange-50 px-3 py-1 rounded-full cursor-pointer hover:bg-[#F68B1E] hover:text-white transition-all">All Brands</span>
             <span className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 cursor-pointer transition-colors">Tech</span>
             <span className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900 cursor-pointer transition-colors">Fashion</span>
          </div>
        </div>

        {brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand: any) => (
              <Link 
                key={brand.id} 
                href={`/search?brandId=${brand.id}`}
                className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[#F68B1E]/10 transition-all duration-500 overflow-hidden flex flex-col h-full"
              >
                {/* Brand Banner */}
                <div className="h-40 relative overflow-hidden">
                  <img 
                    src={brand.bannerUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200'} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div className="bg-white p-2 rounded-2xl shadow-xl w-20 h-20 flex items-center justify-center border-4 border-white">
                      <img 
                        src={brand.logoUrl || 'https://via.placeholder.com/80'} 
                        alt={brand.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {brand.isVerified && (
                      <div className="bg-[#48A44C] text-white p-1 rounded-full shadow-lg mb-1 ring-4 ring-white/20">
                        <ShieldCheck size={14} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Info */}
                <div className="p-6 pt-10 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-[#F68B1E] transition-colors">{brand.name}</h3>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[#F68B1E] transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 mb-6">
                    {brand.description || `Explore the latest collections and innovations from ${brand.name}. Shop original products with warranty.`}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Official Flagship Store</span>
                    <span className="text-[10px] font-black uppercase text-[#F68B1E] flex items-center gap-1 group-hover:underline">
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-50 p-24 text-center">
            <ShoppingBag className="mx-auto text-gray-100 mb-8" size={64} />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Expanding Our Catalog</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8 font-medium italic">We're onboarding more official brand partners to bring you the best products directly.</p>
            <Link href="/" className="inline-block px-12 py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#F68B1E] transition-all transform active:scale-95 shadow-xl shadow-black/10">
              Return Home
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

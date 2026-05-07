'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '../components/home/CategorySidebar';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { FlashSales } from '../components/home/FlashSales';
import { Package, ShieldCheck, RotateCcw, Smartphone, Home as HomeIcon, ChefHat, Tv, Laptop, Baby, ShoppingBag, Gamepad2, Dumbbell, Car, MoreHorizontal } from 'lucide-react';
import { api } from '@/trpc/react';

const categoryIcons: Record<string, any> = {
  'Phones & Tablets': Smartphone,
  'Home & Office': HomeIcon,
  'Appliances': ChefHat,
  'Electronics': Tv,
  'Computing': Laptop,
  'Baby Products': Baby,
  'Fashion': ShoppingBag,
  'Gaming': Gamepad2,
  'Sporting Goods': Dumbbell,
  'Automobile': Car,
};

const TopCategoriesSection = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <section className="container mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-black mb-6 uppercase tracking-tight text-gray-900">Top Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-20 h-20 bg-gray-50 rounded-full" />
                <div className="h-3 bg-gray-50 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mt-6">
      <div className="bg-white rounded-[24px] border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-xl shadow-black/[0.02] p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black uppercase tracking-[0.05em] text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#FF7A00] rounded-full" />
            Top Categories
          </h2>
          <span className="text-[10px] font-black text-[#FF7A00] bg-orange-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-orange-100/50 select-none">
            Curated For You
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
          {categories?.slice(0, 6).map((category: any) => {
            const Icon = categoryIcons[category.name] || MoreHorizontal;
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-4 group cursor-pointer text-center select-none"
              >
                <div className="w-20 h-20 bg-gray-50 text-gray-700 rounded-full group-hover:scale-110 transition-all duration-500 flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-orange-50 group-hover:text-[#FF7A00] group-hover:border-orange-100 group-hover:shadow-md">
                  <Icon size={32} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="text-xs font-black text-gray-600 group-hover:text-[#FF7A00] transition-colors uppercase tracking-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 select-none">
      {/* Hero Section */}
      <section className="container mt-4 md:mt-6 flex flex-col lg:flex-row gap-4 md:gap-6">
        <CategorySidebar />
        <HeroCarousel />
        
        {/* Right Promo (Desktop) */}
        <div className="hidden xl:flex flex-col gap-6 w-[280px]">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-black/[0.02] p-8 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-orange-50 text-[#FF7A00] rounded-[16px] flex items-center justify-center transition-all duration-500 border border-orange-100 group-hover:scale-110 shadow-sm">
                <Package size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">Free Delivery</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Orders over ₦10k</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-green-50 text-[#10B981] rounded-[16px] flex items-center justify-center transition-all duration-500 border border-green-100 group-hover:scale-110 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">Secure Pay</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">100% Safe Checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 text-[#3B82F6] rounded-[16px] flex items-center justify-center transition-all duration-500 border border-blue-100 group-hover:scale-110 shadow-sm">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">Easy Returns</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">7 Days Policy</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1A1A1A] rounded-[24px] shadow-2xl overflow-hidden h-[200px] relative p-8 text-white transition-all duration-500 flex flex-col justify-between group cursor-pointer border border-white/5">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-[#FF7A00]/20 rounded-full blur-3xl group-hover:bg-[#FF7A00]/40 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="font-black text-2xl leading-[0.9] mb-2 tracking-tighter uppercase group-hover:text-[#FF7A00] transition-colors">
                SELL ON <br /> JUMIA
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Join the network</p>
            </div>
            <Link href="/seller/register" className="relative z-10 bg-white text-black px-6 py-4 rounded-[16px] text-[10px] font-black transition-all text-center tracking-widest uppercase hover:bg-[#FF7A00] hover:text-white active:scale-95 duration-300 shadow-xl shadow-black/20">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      <FlashSales />

      {/* Top Categories */}
      <TopCategoriesSection />

      <style jsx>{`
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .container {
            padding: 0 16px;
          }
        }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .pb-12 { padding-bottom: 3rem; }
      `}</style>
    </div>
  );
}

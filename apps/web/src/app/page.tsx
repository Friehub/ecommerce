'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '@/components/home/CategorySidebar';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { FlashSales } from '@/components/home/FlashSales';
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
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-lg font-bold mb-4 uppercase">Top Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-20 h-20 bg-gray-100 rounded-full" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mt-6">
      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="text-lg font-bold mb-4 uppercase">Top Categories</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories?.slice(0, 6).map((category: any) => {
            const Icon = categoryIcons[category.name] || MoreHorizontal;
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group cursor-pointer text-center"
              >
                <div className="w-20 h-20 bg-gray-50 text-gray-700 rounded-full group-hover:scale-110 transition-all flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-[#F68B1E]/10 group-hover:text-[#F68B1E] group-hover:border-[#F68B1E]/20">
                  <Icon size={32} />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-[#F68B1E] transition-colors line-clamp-1">{category.name}</span>
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
    <div className="bg-[#F5F5F5] min-h-screen pb-12">
      {/* Hero Section */}
      <section className="container mt-4 flex gap-4">
        <CategorySidebar />
        <HeroCarousel />
        
        {/* Right Promo (Desktop) */}
        <div className="hidden xl:flex flex-col gap-4 w-[240px]">
          <div className="bg-white rounded shadow-sm p-4 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F68B1E]/10 text-[#F68B1E] rounded-full flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Free Delivery</h4>
                <p className="text-[10px] text-gray-500">For orders over ₦10k</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#48A44C]/10 text-[#48A44C] rounded-full flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Secure Payment</h4>
                <p className="text-[10px] text-gray-500">100% Secure Transaction</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2196F3]/10 text-[#2196F3] rounded-full flex items-center justify-center">
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Easy Return</h4>
                <p className="text-[10px] text-gray-500">7 Days Return Policy</p>
              </div>
            </div>
          </div>
          <div className="bg-[#282828] rounded shadow-sm overflow-hidden h-[180px] relative p-4 text-white">
            <h3 className="font-bold text-lg leading-tight mb-2">SELL ON JUMIA</h3>
            <p className="text-xs text-gray-400">Join thousands of successful sellers</p>
            <Link href="/seller/register" className="mt-4 border border-white text-white px-4 py-2 rounded text-xs font-bold hover:bg-white hover:text-black transition-all inline-block text-center">
              REGISTER NOW
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .pb-12 { padding-bottom: 3rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .w-20 { width: 5rem; }
        .h-20 { height: 5rem; }
        .w-\[240px\] { width: 240px; }
        .h-\[180px\] { height: 180px; }
        .bg-\[\#F5F5F5\] { background-color: #f5f5f5; }
        .bg-white { background-color: #ffffff; }
        .bg-\[\#282828\] { background-color: #282828; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .rounded { border-radius: 4px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .overflow-hidden { overflow: hidden; }
        .text-white { color: #ffffff; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-400 { color: #9ca3af; }
        .grid { display: grid; }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
        .hidden { display: none; }
        .cursor-pointer { cursor: pointer; }
        .transition-transform { transition-property: transform; }
        .transition-all { transition: all 0.2s ease; }
        
        @media (min-width: 768px) {
          .md\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        }
        @media (min-width: 1200px) {
          .xl\:flex { display: flex; }
        }
      `}</style>
    </div>
  );
}

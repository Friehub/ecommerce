// apps/web/src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '@/components/home/CategorySidebar';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { AdBanners } from '@/components/home/AdBanners';
import { FlashSales } from '@/components/home/FlashSales';
import { ProductSection } from '@/components/home/ProductSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HelpCircle, Store, ChevronRight } from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Home() {
  return (
    <main className="min-h-screen pb-12 bg-j-background">
      <div className="max-w-[1184px] mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Hero Section (Sidebar + Carousel + Right Bar) */}
        <div className="flex flex-col lg:flex-row gap-4 h-[450px]">
          {/* SideNavBar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <CategorySidebar />
          </aside>

          {/* Hero Carousel */}
          <div className="flex-1 min-w-0">
            <HeroCarousel />
          </div>

          {/* Right Sidebar Quick Links */}
          <div className="hidden lg:flex flex-col w-56 gap-4 h-full">
            <Link 
              href="/help" 
              className="flex-1 bg-white rounded-sm p-4 flex flex-col justify-center items-center gap-3 border border-j-border hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-jumia-orange group-hover:scale-110 transition-transform">
                <HelpCircle size={24} />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-black uppercase tracking-wider block">Help Center</span>
                <span className="text-[9px] font-bold text-j-text-muted uppercase">Customer care guide</span>
              </div>
            </Link>
            
            <Link 
              href="/seller" 
              className="flex-1 bg-white rounded-sm p-4 flex flex-col justify-center items-center gap-3 border border-j-border hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-jumia-orange group-hover:scale-110 transition-transform">
                <Store size={24} />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-black uppercase tracking-wider block">Sell on Jumia</span>
                <span className="text-[9px] font-bold text-j-text-muted uppercase">Open your store</span>
              </div>
            </Link>
            
            <div className="flex-1 bg-jumia-orange rounded-sm p-4 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all">
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
               <div className="relative z-10 flex flex-col justify-center h-full text-white">
                <span className="text-lg font-black uppercase tracking-tighter italic leading-tight">Jumia <br/>Food</span>
                <span className="text-[9px] font-black uppercase opacity-80 mt-2">Delivery near you</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Grid Below Hero */}
        <CategoryGrid />

        {/* Flash Sales */}
        <FlashSales />

        {/* Ad Banners */}
        <AdBanners />

        {/* Dynamic Product Sections from Live Category Tree */}
        <div className="flex flex-col gap-0">
          <HomepageDynamicSections />
        </div>
      </div>
    </main>
  );
}

function HomepageDynamicSections() {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-8 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-sm border border-j-border p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="aspect-[3/4] rounded-sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {categories?.slice(0, 8).map((category: any, idx: number) => (
        <ProductSection 
          key={category.id} 
          title={category.name} 
          categoryId={category.id} 
          color={idx % 2 === 0 ? 'blue' : 'orange'}
        />
      ))}
    </>
  );
}

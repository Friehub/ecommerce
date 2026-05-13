'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '@/components/home/CategorySidebar';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { AdBanners } from '@/components/home/AdBanners';
import { FlashSales } from '@/components/home/FlashSales';
import { ProductSection } from '@/components/home/ProductSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Package, ShieldCheck, RotateCcw, Store, ChevronRight } from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Home() {
  return (
    <main className="min-h-screen pb-32 select-none bg-surface-container-lowest/50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Hero Section Grid */}
        <section className="grid grid-cols-12 gap-8 items-start">
          {/* Category Sidebar (Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24">
            <CategorySidebar />
          </aside>
          
          {/* Hero Carousel (Full width on mobile, 9 cols on desktop) */}
          <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 xl:col-span-9">
                <HeroCarousel />
              </div>
              
              {/* Side Promo Actions - Adjusted for better layout */}
              <div className="hidden xl:flex xl:col-span-3 flex-col gap-6">
                <div className="bg-surface-container-lowest rounded-[40px] p-8 border-4 border-surface-container-low shadow-soft flex flex-col justify-between gap-8 transition-all hover:shadow-2xl">
                  {[
                    { icon: <Package size={20} className="text-primary-container" />, title: 'Free Delivery', sub: 'Priority shipping' },
                    { icon: <ShieldCheck size={20} className="text-primary-container" />, title: 'Secure Pay', sub: 'Verified gateway' },
                    { icon: <RotateCcw size={20} className="text-primary-container" />, title: 'Easy Returns', sub: 'No questions asked' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 group cursor-pointer shrink-0">
                      <div className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all border border-outline-variant/30">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">{item.title}</h4>
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1 opacity-60 italic">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-on-surface rounded-[40px] p-8 text-white relative overflow-hidden group cursor-pointer shadow-2xl border-4 border-surface-container-low flex-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/40 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <Store size={22} className="text-primary-container" />
                    </div>
                    <h3 className="text-3xl font-black leading-[0.9] uppercase tracking-tighter mb-8 group-hover:text-primary-container transition-colors">
                      Empower <br /> Your Brand
                    </h3>
                    <Link href="/seller/register" className="inline-flex items-center gap-4 bg-primary-container text-white px-10 py-5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-on-surface transition-all shadow-2xl active:scale-95">
                      Start Selling <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Banners */}
        <AdBanners />

        {/* Flash Sales */}
        <FlashSales />

        {/* Category Matrix (The Grid) */}
        <CategoryGrid />

        {/* Dynamic Product Sections from Live Category Tree */}
        <div className="mt-16">
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
      <div className="space-y-16">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-container-low rounded-[48px] border-4 border-surface-container-lowest h-[480px] overflow-hidden">
            <Skeleton className="h-16 w-full" />
            <div className="p-8 grid grid-cols-2 md:grid-cols-6 gap-6">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="aspect-[3/4] rounded-[32px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories?.slice(0, 8).map((category: any) => (
        <ProductSection 
          key={category.id} 
          title={category.name} 
          categoryId={category.id} 
        />
      ))}
    </div>
  );
}

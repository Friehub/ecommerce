'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '../components/home/CategorySidebar';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { AdBanners } from '../components/home/AdBanners';
import { FlashSales } from '../components/home/FlashSales';
import { ProductSection } from '../components/home/ProductSection';
import { TrendingNow } from '../components/home/TrendingNow';
import { Package, ShieldCheck, RotateCcw } from 'lucide-react';
import { api } from '@/trpc/react';

export default function Home() {
  return (
    <main className="min-h-screen pb-20 select-none">
      <div className="container py-6">
        {/* Hero Section Grid */}
        <section className="grid grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Category Sidebar (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-2">
            <CategorySidebar />
          </div>
          
          {/* Hero Carousel (Full width on mobile, 7 cols on desktop) */}
          <div className="col-span-12 lg:col-span-7">
            <HeroCarousel />
          </div>

          {/* Side Promo Actions (Now visible on mobile via horizontal scroll) */}
          <div className="col-span-12 lg:col-span-3">
            <div className="flex lg:flex-col gap-4 lg:gap-6 h-full overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0">
              <div className="bg-white rounded-xl p-4 lg:p-6 border border-outline-variant/30 shadow-sm flex-1 flex flex-row lg:flex-col justify-center gap-6 lg:gap-8 min-w-[320px] lg:min-w-0">
                {[
                  { icon: <Package size={20} className="text-primary" />, title: 'Free Delivery', sub: 'Over ₦10k' },
                  { icon: <ShieldCheck size={20} className="text-primary" />, title: 'Secure Pay', sub: '100% Safe' },
                  { icon: <RotateCcw size={20} className="text-primary" />, title: 'Easy Returns', sub: '7 Days' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 lg:gap-4 group cursor-pointer shrink-0">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all border border-primary/10">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-inter text-[11px] lg:text-sm font-black uppercase tracking-tight text-on-surface">{item.title}</h4>
                      <p className="font-inter text-[9px] lg:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-inverse-surface rounded-xl p-5 lg:p-8 text-white relative overflow-hidden group cursor-pointer shadow-lg flex-1 min-w-[240px] lg:min-w-0">
                <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
                <div className="relative z-10">
                  <h3 className="font-inter text-lg lg:text-2xl font-black leading-tight uppercase tracking-tighter mb-3 lg:mb-4 group-hover:text-primary-container transition-colors">
                    SELL ON <br className="hidden lg:block" /> JUMIA
                  </h3>
                  <Link href="/seller/register" className="inline-block bg-white text-black px-4 py-2 lg:px-6 lg:py-3 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all shadow-xl active:scale-95">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Banners */}
        <AdBanners />

        {/* Flash Sales */}
        <FlashSales />

        {/* Trending Categories */}
        <TrendingNow />

        {/* Dynamic Product Sections from Live Category Tree */}
        <div className="flex flex-col gap-stack-lg mt-stack-lg">
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
      <div className="flex flex-col gap-stack-lg">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-outline-variant/20 animate-pulse h-[400px]" />
        ))}
      </div>
    );
  }

  // We only show top-level categories that have products (ProductSection handles empty check)
  // Limit to 6 categories to avoid overwhelming the homepage
  return (
    <>
      {categories?.slice(0, 6).map((category: any) => (
        <ProductSection 
          key={category.id} 
          title={category.name} 
          categoryId={category.id} 
        />
      ))}
    </>
  );
}

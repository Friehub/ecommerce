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
      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        {/* Hero Section (Sidebar + Carousel + Right Bar) */}
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* SideNavBar */}
          <aside className="hidden lg:block w-64">
            <CategorySidebar />
          </aside>

          {/* Hero Carousel */}
          <div className="flex-1 min-h-[400px]">
            <HeroCarousel />
          </div>

          {/* Right Sidebar Quick Links */}
          <div className="hidden lg:flex flex-col w-56 gap-gutter h-full">
            <Link 
              href="/help" 
              className="flex-1 bg-j-surface-container-lowest rounded p-4 flex items-center gap-3 border border-j-outline-variant hover:shadow-sm transition-shadow group"
            >
              <HelpCircle size={32} className="text-jumia-orange group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-label-bold block font-bold">Help Center</span>
                <span className="text-body-sm text-j-text-muted">Customer care guide</span>
              </div>
            </Link>
            
            <Link 
              href="/seller/register" 
              className="flex-1 bg-j-surface-container-lowest rounded p-4 flex items-center gap-3 border border-j-outline-variant hover:shadow-sm transition-shadow group"
            >
              <Store size={32} className="text-jumia-orange group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-label-bold block font-bold">Sell on Jumia</span>
                <span className="text-body-sm text-j-text-muted">Open your store</span>
              </div>
            </Link>
            
            <div className="flex-1 bg-jumia-orange/5 rounded p-4 border border-jumia-orange/20 relative overflow-hidden group cursor-pointer">
              <div className="relative z-10 flex flex-col justify-center h-full">
                <span className="text-label-bold block font-bold text-jumia-orange">Jumia Food</span>
                <span className="text-body-sm text-j-text-muted">Delivery near you</span>
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
        <div className="flex flex-col gap-4">
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-j-surface-container-lowest rounded border border-j-outline-variant p-4">
            <Skeleton className="h-10 w-48 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="aspect-square rounded" />
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

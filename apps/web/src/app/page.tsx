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

export default function Home() {
  return (
    <main className="bg-surface-bright min-h-screen pb-20 select-none">
      <div className="max-w-container-max mx-auto px-gutter py-stack-md">
        {/* Hero Section Grid */}
        <section className="grid grid-cols-12 gap-6 items-start">
          {/* Category Sidebar */}
          <div className="hidden lg:block lg:col-span-2">
            <CategorySidebar />
          </div>
          
          {/* Hero Carousel */}
          <div className="col-span-12 lg:col-span-7">
            <HeroCarousel />
          </div>

          {/* Side Promo Actions */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 h-full">
            <div className="bg-surface rounded-xl p-6 border border-outline-variant/30 shadow-sm flex-1 flex flex-col justify-center gap-8">
              {[
                { icon: <Package size={24} className="text-primary" />, title: 'Free Delivery', sub: 'Orders over ₦10k' },
                { icon: <ShieldCheck size={24} className="text-primary" />, title: 'Secure Pay', sub: '100% Safe Checkout' },
                { icon: <RotateCcw size={24} className="text-primary" />, title: 'Easy Returns', sub: '7 Days Policy' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all border border-primary/10">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-inter text-sm font-black uppercase tracking-tight text-on-surface">{item.title}</h4>
                    <p className="font-inter text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-inverse-surface rounded-xl p-8 text-white relative overflow-hidden group cursor-pointer shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
              <div className="relative z-10">
                <h3 className="font-inter text-2xl font-black leading-tight uppercase tracking-tighter mb-4 group-hover:text-primary-container transition-colors">
                  SELL ON <br /> JUMIA
                </h3>
                <Link href="/seller/register" className="inline-block bg-white text-black px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all shadow-xl active:scale-95">
                  Register Now
                </Link>
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

        {/* Product Sections with Premium Styling */}
        <div className="flex flex-col gap-stack-lg mt-stack-lg">
          <ProductSection title="Phone Deals" categoryId="phones-tablets" />
          <ProductSection title="Computing Essentials" categoryId="computing" />
          <ProductSection title="Fashion Picks" categoryId="fashion" />
          <ProductSection title="Health & Beauty" categoryId="health-beauty" />
          <ProductSection title="Baby Essentials" categoryId="baby-products" />
        </div>
      </div>
    </main>
  );
}

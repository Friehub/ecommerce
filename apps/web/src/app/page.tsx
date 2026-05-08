'use client';

import React from 'react';
import Link from 'next/link';
import { CategorySidebar } from '../components/home/CategorySidebar';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { AdBanners } from '../components/home/AdBanners';
import { FlashSales } from '../components/home/FlashSales';
import { Package, ShieldCheck, RotateCcw, Smartphone, Home as HomeIcon, ChefHat, Tv, Laptop, Baby, ShoppingBag, Gamepad2, Dumbbell, Car, MoreHorizontal, Globe, TrendingUp, Zap } from 'lucide-react';
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

const QuickLinks = () => (
  <div className="lg:hidden container mt-6 overflow-x-auto no-scrollbar">
    <div className="flex gap-4 pb-4 min-w-max">
      {[
        { label: 'Global', icon: <Globe size={20} />, color: 'bg-blue-500', href: '/jumia-global' },
        { label: 'Official', icon: <ShieldCheck size={20} />, color: 'bg-green-500', href: '/official-stores' },
        { label: 'Best', icon: <TrendingUp size={20} />, color: 'bg-orange-500', href: '/best-sellers' },
        { label: 'Flash', icon: <Zap size={20} />, color: 'bg-red-500', href: '/flash-sales' },
        { label: 'Food', icon: <ChefHat size={20} />, color: 'bg-yellow-500', href: '#' },
        { label: 'Bills', icon: <Smartphone size={20} />, color: 'bg-purple-500', href: '#' },
      ].map((link, i) => (
        <Link key={i} href={link.href} className="flex flex-col items-center gap-2 group">
          <div className={`${link.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 group-active:scale-95 transition-transform`}>
            {link.icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">{link.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

const TopCategoriesSection = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <section className="container mt-8 md:mt-12">
        <div className="bg-white rounded-[32px] shadow-sm p-8 border border-gray-100">
          <div className="h-6 bg-gray-50 rounded w-32 mb-8 animate-pulse" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full" />
                <div className="h-3 bg-gray-50 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mt-8 md:mt-12">
      <div className="bg-white rounded-[32px] border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-xl shadow-black/[0.02] p-6 md:p-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#FF7A00] rounded-full" />
            Top Categories
          </h2>
          <Link href="/categories" className="text-[10px] font-black text-[#FF7A00] hover:underline uppercase tracking-widest">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-12">
          {categories?.slice(0, 6).map((category: any) => {
            const Icon = categoryIcons[category.name] || MoreHorizontal;
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-4 group cursor-pointer text-center select-none"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 text-gray-700 rounded-full group-hover:scale-110 transition-all duration-500 flex items-center justify-center border border-gray-100 shadow-sm group-hover:bg-orange-50 group-hover:text-[#FF7A00] group-hover:border-orange-100 group-hover:shadow-md">
                  <Icon size={28} className="group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <span className="text-[10px] md:text-xs font-black text-gray-600 group-hover:text-[#FF7A00] transition-colors uppercase tracking-tight">
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
    <div className="bg-[#F8F9FA] min-h-screen pb-20 select-none">
      {/* Hero Section */}
      <section className="container mt-4 md:mt-8 flex flex-col lg:flex-row gap-6">
        {/* Category sidebar — desktop only */}
        <div className="hidden lg:block shrink-0">
          <CategorySidebar />
        </div>
        <HeroCarousel />
        
        {/* Right Promo (Desktop) */}
        <div className="hidden xl:flex flex-col gap-6 w-[300px]">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-black/[0.02] p-8 flex-1 flex flex-col justify-between">
            {[
              { icon: <Package size={24} />, title: 'Free Delivery', sub: 'Orders over ₦10k', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
              { icon: <ShieldCheck size={24} />, title: 'Secure Pay', sub: '100% Safe Checkout', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
              { icon: <RotateCcw size={24} />, title: 'Easy Returns', sub: '7 Days Policy', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center transition-all duration-500 border ${item.border} group-hover:scale-110 shadow-sm`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-[#1A1A1A] rounded-[28px] shadow-2xl overflow-hidden h-[210px] relative p-8 text-white transition-all duration-500 flex flex-col justify-between group cursor-pointer border border-white/5">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-[#FF7A00]/20 rounded-full blur-3xl group-hover:bg-[#FF7A00]/40 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="font-black text-2xl leading-[0.9] mb-2 tracking-tighter uppercase group-hover:text-[#FF7A00] transition-colors">
                SELL ON <br /> JUMIA
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Join the network</p>
            </div>
            <Link href="/seller/register" className="relative z-10 bg-white text-black px-6 py-4 rounded-xl text-[10px] font-black transition-all text-center tracking-widest uppercase hover:bg-[#FF7A00] hover:text-white active:scale-95 duration-300 shadow-xl shadow-black/20">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Quick Links */}
      <QuickLinks />

      {/* Ad Banners Section */}
      <AdBanners />

      {/* Flash Sales */}
      <div className="mt-8 md:mt-12">
        <FlashSales />
      </div>

      {/* Top Categories */}
      <TopCategoriesSection />

    </div>
  );
}

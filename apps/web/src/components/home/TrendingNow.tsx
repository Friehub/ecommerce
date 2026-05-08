'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '../../trpc/react';
import { MoreHorizontal, Smartphone, Home as HomeIcon, ChefHat, Tv, Laptop, Baby, ShoppingBag, Gamepad2, Dumbbell, Car } from 'lucide-react';

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

export const TrendingNow = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <section className="mt-stack-lg">
        <div className="h-8 w-48 bg-surface-variant rounded mb-6 animate-pulse"></div>
        <div className="flex gap-8 overflow-x-auto pb-4 hide-scrollbar">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
              <div className="w-20 h-20 bg-surface-variant rounded-full"></div>
              <div className="h-4 w-16 bg-surface-variant rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-stack-lg bg-surface p-8 rounded-xl border border-outline-variant/20 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-inter text-xl font-bold uppercase tracking-tight text-on-surface">Trending Now</h2>
        <Link href="/categories" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">
          View All
        </Link>
      </div>
      <div className="flex gap-8 overflow-x-auto pb-2 hide-scrollbar">
        {categories?.slice(0, 8).map((category: any) => {
          const Icon = categoryIcons[category.name] || MoreHorizontal;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-4 group min-w-[80px]"
            >
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110">
                <Icon size={32} />
              </div>
              <span className="font-inter text-[10px] font-bold uppercase tracking-tight text-on-surface-variant text-center group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

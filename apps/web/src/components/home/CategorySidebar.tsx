'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  Home, 
  ChefHat, 
  Tv, 
  Laptop, 
  Baby, 
  ShoppingBag, 
  Gamepad2, 
  Dumbbell, 
  Car,
  MoreHorizontal,
  ShieldCheck,
  Globe,
  TrendingUp
} from 'lucide-react';
import { api } from '../../trpc/react';

const categoryIcons: Record<string, any> = {
  'Phones & Tablets': Smartphone,
  'Home & Office': Home,
  'Appliances': ChefHat,
  'Electronics': Tv,
  'Computing': Laptop,
  'Baby Products': Baby,
  'Fashion': ShoppingBag,
  'Gaming': Gamepad2,
  'Sporting Goods': Dumbbell,
  'Automobile': Car,
};

export const CategorySidebar = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-surface rounded-lg shadow-sm p-stack-sm flex flex-col gap-base border border-outline-variant/30 h-[480px] animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-surface-variant rounded-lg" />
        ))}
      </aside>
    );
  }

  return (
    <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-surface rounded-lg shadow-sm p-stack-sm flex flex-col gap-base border border-outline-variant/30">
      <div className="flex flex-col gap-1">
        {categories?.map((category: any) => {
          const Icon = categoryIcons[category.name] || MoreHorizontal;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-all duration-200 group"
            >
              <Icon size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-body-md text-sm text-on-surface-variant group-hover:text-primary truncate">{category.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="border-t border-outline-variant my-2"></div>
      <div className="flex flex-col gap-1">
        <Link href="/official-stores" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-all duration-200 group">
          <ShieldCheck size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="font-body-md text-sm text-on-surface-variant group-hover:text-primary">Official Stores</span>
        </Link>
        <Link href="/jumia-global" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-all duration-200 group">
          <Globe size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="font-body-md text-sm text-on-surface-variant group-hover:text-primary">Jumia Global</span>
        </Link>
        <Link href="/best-sellers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-variant transition-all duration-200 group">
          <TrendingUp size={20} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="font-body-md text-sm text-on-surface-variant group-hover:text-primary">Best Sellers</span>
        </Link>
      </div>
    </aside>
  );
};

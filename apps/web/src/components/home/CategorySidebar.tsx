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
  MoreHorizontal
} from 'lucide-react';
import { api } from '@/trpc/react';

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
      <div className="bg-white rounded-xl shadow-md p-5 w-[240px] h-[480px] animate-pulse border border-gray-100 flex flex-col justify-between">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-7 bg-gray-100 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <aside className="bg-white rounded-xl shadow-md w-[240px] overflow-hidden hidden lg:block border border-gray-100 hover:border-gray-200 transition-all duration-300">
      <nav className="flex flex-col py-3">
        {categories?.map((category: any) => {
          const Icon = categoryIcons[category.name] || MoreHorizontal;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-[#F68B1E] hover:bg-orange-50/40 transition-all duration-200 relative group"
            >
              <div className="text-gray-400 group-hover:text-[#F68B1E] group-hover:scale-110 transition-all duration-200">
                <Icon size={18} />
              </div>
              <span className="truncate flex-1">{category.name}</span>
              {/* Subtle indicator bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F68B1E] scale-y-0 group-hover:scale-y-100 transition-all duration-200" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

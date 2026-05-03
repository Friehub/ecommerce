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
    <aside className="bg-white rounded-lg shadow-sm w-[240px] overflow-hidden hidden lg:block border border-gray-200">
      <nav className="flex flex-col py-2">
        {categories?.map((category: any) => {
          const Icon = categoryIcons[category.name] || MoreHorizontal;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#F68B1E] hover:bg-gray-50 duration-150 transition-all"
            >
              <div className="text-gray-400 group-hover:text-[#F68B1E]">
                <Icon size={18} />
              </div>
              <span className="truncate flex-1">{category.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

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
      <div className="bg-white rounded shadow-sm p-4 w-[240px] h-[480px] animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <aside className="bg-white rounded shadow-sm w-[240px] overflow-hidden hidden lg:block">
      <nav className="flex flex-col py-2">
        {categories?.map((category: any) => {
          const Icon = categoryIcons[category.name] || MoreHorizontal;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:text-[#F68B1E] hover:bg-gray-50 transition-colors"
            >
              <Icon size={20} className="text-gray-500" />
              <span>{category.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <style jsx>{`
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .rounded { border-radius: 4px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-4 { padding: 1rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .w-\[240px\] { width: 240px; }
        .h-\[480px\] { height: 480px; }
        .h-8 { height: 2rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .gap-3 { gap: 12px; }
        .text-sm { font-size: 0.875rem; }
        .text-gray-700 { color: #374151; }
        .text-gray-500 { color: #6b7280; }
        .hidden { display: none; }
        .overflow-hidden { overflow: hidden; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        @media (min-width: 1024px) {
          .lg\:block { display: block; }
        }
      `}</style>
    </aside>
  );
};

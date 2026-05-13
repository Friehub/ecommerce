'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ShieldCheck, 
  Globe, 
  TrendingUp, 
  Layers,
  Zap,
  ShoppingBag,
  Award
} from 'lucide-react';
import { api } from '../../trpc/react';
import { categoryIcons, DefaultCategoryIcon } from '../../constants/categoryIcons';
import { Skeleton } from '../ui/Skeleton';

export const CategorySidebar = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <aside className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft p-6 space-y-4 animate-pulse">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
             <div className="w-8 h-8 bg-surface-container-low rounded-xl" />
             <div className="h-3 bg-surface-container-low rounded-full w-24" />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft overflow-hidden group/sidebar">
      <div className="p-4 border-b-2 border-surface-container-low bg-surface-container-low/30">
        <div className="flex items-center gap-3 px-2">
          <Layers size={16} className="text-primary-container" />
          <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-on-surface">Precision Nodes</h3>
        </div>
      </div>
      
      <div className="py-4 max-h-[520px] overflow-y-auto hide-scrollbar custom-scrollbar">
        {categories?.map((category: any) => {
          const Icon = categoryIcons[category.name] || DefaultCategoryIcon;
          return (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex items-center justify-between p-3.5 mx-2 rounded-2xl hover:bg-surface-container-low transition-all duration-500 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-surface-container-low rounded-xl flex items-center justify-center border border-outline-variant/30 group-hover:bg-primary-container group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant/80 group-hover:text-on-surface transition-colors truncate max-w-[120px]">
                  {category.name}
                </span>
              </div>
              <ChevronRight size={12} className="text-outline-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
      
      <div className="p-3 bg-on-surface border-t-4 border-primary-container/20 space-y-1">
        {[
          { label: 'Official Outlets', href: '/official-stores', icon: ShieldCheck, color: 'text-success' },
          { label: 'Global Logistics', href: '/jumia-global', icon: Globe, color: 'text-primary-container' },
          { label: 'Market Velocity', href: '/best-sellers', icon: Zap, color: 'text-warning' }
        ].map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/5 transition-all duration-500 group"
          >
            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary-container transition-all">
              <item.icon size={16} className={`${item.color} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
            </div>
            <span className="font-black text-[9px] uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

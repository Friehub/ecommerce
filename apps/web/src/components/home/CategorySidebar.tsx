'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { api } from '../../trpc/react';
import { categoryIcons, DefaultCategoryIcon } from '../../constants/categoryIcons';
import { Skeleton } from '../ui/Skeleton';

export const CategorySidebar = () => {
  const { data: categories, isLoading } = api.catalog.getCategories.useQuery();

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl border-2 border-surface-container-low shadow-soft p-6 space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
                  <Icon size={16} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors truncate max-w-[120px]">{category.name}</span>
              </div>
              <ChevronRight size={12} className="text-outline-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
      
      <div className="p-2 space-y-1">
        <div className="border-t-2 border-outline-variant/30 my-2 mx-2"></div>
        {[
          { label: 'Official Stores', href: '/official-stores', icon: ShieldCheck },
          { label: 'Jumia Global', href: '/jumia-global', icon: Globe },
          { label: 'Best Sellers', href: '/best-sellers', icon: TrendingUp }
        ].map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low transition-all duration-300 group"
          >
            <div className="w-8 h-8 bg-surface-container-low rounded-xl flex items-center justify-center border border-outline-variant group-hover:border-primary-container transition-all">
              <item.icon size={16} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};


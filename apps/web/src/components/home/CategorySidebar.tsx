// apps/web/src/components/home/CategorySidebar.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/trpc/react';
import * as Icons from 'lucide-react';

export const CategorySidebar = () => {
  const { data: categories } = api.catalog.getCategories.useQuery();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white rounded-sm border border-j-border shadow-sm overflow-hidden h-[450px]">
      <ul className="flex flex-col py-2 overflow-y-auto hide-scrollbar">
        {(categories || []).slice(0, 12).map((cat: any) => (
          <li key={cat.id}>
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center justify-between py-2.5 px-4 hover:bg-j-surface-container-low transition-colors group"
            >
              <div className="flex items-center gap-3">
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt={cat.name} width={20} height={20} className="w-5 h-5 object-contain" unoptimized={true} />
                ) : (
                  <Icons.Layers size={16} className="text-j-text-muted group-hover:text-jumia-orange transition-colors" />
                )}
                <span className="text-[11px] font-bold text-j-text group-hover:text-jumia-orange transition-colors uppercase tracking-tight">
                  {cat.name}
                </span>
              </div>
              <Icons.ChevronRight size={14} className="text-j-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Link>
          </li>
        ))}
        {categories && categories.length > 12 && (
          <li className="border-t border-j-border mt-2 pt-2">
            <Link
              href="/categories"
              className="flex items-center gap-3 py-3 px-4 text-[10px] font-black text-jumia-orange uppercase hover:bg-orange-50 transition-colors"
            >
              <Icons.MoreHorizontal size={16} />
              Other Categories
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
};

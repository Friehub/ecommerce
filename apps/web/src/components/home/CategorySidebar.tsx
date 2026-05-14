// apps/web/src/components/home/CategorySidebar.tsx
'use client';
import Link from 'next/link';
import { api } from '@/trpc/react';
import * as Icons from 'lucide-react';

export const CategorySidebar = () => {
  const { data: categories } = api.catalog.getCategories.useQuery();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full gap-stack-sm p-4 bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm overflow-y-auto min-h-[400px]">
      <div className="mb-2">
        <h2 className="text-headline-sm text-j-text font-bold">Categories</h2>
        <p className="text-body-sm text-j-text-muted">Shop by Department</p>
      </div>
      <ul className="flex flex-col gap-1">
        {(categories || []).map((cat: any) => (
          <li key={cat.id}>
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-j-surface-container-high transition-all text-j-text hover:text-jumia-orange group"
            >
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 object-contain" />
              ) : (
                <Icons.Layers size={18} className="text-j-text-muted group-hover:text-jumia-orange" />
              )}
              <span className="text-body-md">{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

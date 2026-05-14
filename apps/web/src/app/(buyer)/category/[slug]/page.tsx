// apps/web/src/app/(buyer)/category/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ChevronRight, Filter, SlidersHorizontal, PackageSearch, Search } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const initialMin = searchParams.get('minPrice') || '';
  const initialMax = searchParams.get('maxPrice') || '';
  const initialSort = searchParams.get('sort') || 'RELEVANCE';

  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  const { data: category, isLoading: isCatLoading } = api.catalog.getCategoryBySlug.useQuery({ slug });
  
  const { data: products, isLoading: isProdLoading } = api.catalog.listProducts.useQuery(
    { 
      categoryId: category?.id,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: initialSort
    },
    { enabled: !!category?.id }
  );

  const handleSyncFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (minPrice) current.set('minPrice', minPrice);
    else current.delete('minPrice');
    if (maxPrice) current.set('maxPrice', maxPrice);
    else current.delete('maxPrice');
    router.push(`/category/${slug}?${current.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sort', e.target.value);
    router.push(`/category/${slug}?${current.toString()}`);
  };

  if (isCatLoading) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="w-64 h-[600px] hidden lg:block rounded-sm" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-[1184px] mx-auto px-4 py-32 text-center">
        <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-jumia-orange border-2 border-orange-100">
          <Search size={40} />
        </div>
        <h1 className="text-2xl font-black mb-4 uppercase tracking-tight">Category not found</h1>
        <Link href="/" className="bg-jumia-orange text-white px-8 py-3 rounded-sm font-black uppercase tracking-wider shadow-lg hover:bg-orange-600 transition-all">Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1184px] mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-j-text-muted uppercase tracking-wider">
        <Link href="/" className="hover:text-jumia-orange transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-j-text truncate">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-sm border border-j-border shadow-sm sticky top-24 overflow-hidden">
            <div className="p-4 border-b border-j-border flex items-center gap-3 bg-j-background">
              <SlidersHorizontal size={18} className="text-jumia-orange" />
              <h3 className="text-[11px] font-black uppercase tracking-wider">Filters</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-10">
              {/* Categories */}
              <div>
                <h4 className="text-[10px] font-black mb-4 uppercase tracking-widest text-j-text-muted">Category</h4>
                <ul className="flex flex-col gap-3">
                  {category.children?.map((child: any) => (
                    <li key={child.id}>
                      <Link 
                        href={`/category/${child.slug}`} 
                        className="text-[11px] font-bold text-j-text hover:text-jumia-orange transition-colors uppercase tracking-tight"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  {(!category.children || category.children.length === 0) && (
                    <li className="text-[10px] text-j-text-muted italic uppercase font-bold opacity-50">No sub-categories</li>
                  )}
                </ul>
              </div>

              {/* Price Filter */}
              <div className="pt-6 border-t border-j-border">
                <h4 className="text-[10px] font-black mb-4 uppercase tracking-widest text-j-text-muted">Price (₦)</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-j-background border-2 border-j-border rounded-sm px-3 py-2 text-[11px] font-black focus:border-jumia-orange outline-none transition-colors" 
                    />
                    <span className="text-j-text-muted font-black">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-j-background border-2 border-j-border rounded-sm px-3 py-2 text-[11px] font-black focus:border-jumia-orange outline-none transition-colors" 
                    />
                  </div>
                  <button 
                    onClick={handleSyncFilters}
                    className="w-full bg-jumia-orange text-white py-3 rounded-sm text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-sm border border-j-border p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <h1 className="text-xl font-black text-j-text uppercase tracking-tight leading-none">{category.name}</h1>
              <p className="text-[10px] text-j-text-muted font-black uppercase tracking-widest opacity-70">{products?.results?.length || 0} products found</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-j-text-muted uppercase tracking-widest shrink-0">Sort by:</span>
              <select 
                value={initialSort}
                onChange={handleSortChange}
                className="bg-j-background border-2 border-j-border rounded-sm px-4 py-2 text-[11px] font-black uppercase tracking-tight outline-none cursor-pointer focus:border-jumia-orange transition-colors min-w-[180px]"
              >
                <option value="RELEVANCE">Popularity</option>
                <option value="NEWEST">Newest</option>
                <option value="PRICE_LOW">Price: Low to High</option>
                <option value="PRICE_HIGH">Price: High to Low</option>
                <option value="RATING">Rating</option>
              </select>
            </div>
          </div>

          {isProdLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-sm" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-sm border border-j-border py-32 text-center px-8 shadow-sm">
              <div className="w-20 h-20 bg-j-background rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-j-border text-j-border">
                <PackageSearch size={40} />
              </div>
              <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-j-text">No products found</h3>
              <p className="text-[11px] text-j-text-muted mb-10 uppercase font-black tracking-widest opacity-60">Try adjusting your filters or search for something else.</p>
              <Link href="/" className="bg-jumia-orange text-white px-10 py-4 rounded-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg">
                Continue Shopping
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

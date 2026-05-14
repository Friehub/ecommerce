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
      <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="flex flex-col lg:flex-row gap-gutter">
          <Skeleton className="w-64 h-[600px] hidden lg:block" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-container-max mx-auto px-margin-desktop py-32 text-center">
        <div className="bg-j-surface-container-low w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search size={32} className="text-j-text-muted" />
        </div>
        <h1 className="text-headline-md font-bold mb-4">Category not found</h1>
        <Link href="/" className="text-jumia-orange font-bold hover:underline">Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-stack-md">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4 text-body-sm text-j-text-muted">
        <Link href="/" className="hover:text-jumia-orange">Home</Link>
        <ChevronRight size={14} />
        <span className="text-j-text truncate">{category.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant shadow-sm sticky top-24">
            <div className="p-4 border-b border-j-outline-variant flex items-center gap-2 bg-j-surface-container-low">
              <SlidersHorizontal size={18} className="text-jumia-orange" />
              <h3 className="text-label-bold font-bold uppercase">Filters</h3>
            </div>
            
            <div className="p-4 flex flex-col gap-8">
              {/* Categories */}
              <div>
                <h4 className="text-body-sm font-bold mb-3 uppercase text-j-text-muted">Category</h4>
                <ul className="flex flex-col gap-2">
                  {category.children?.map((child: any) => (
                    <li key={child.id}>
                      <Link 
                        href={`/category/${child.slug}`} 
                        className="text-body-sm text-j-text hover:text-jumia-orange transition-colors"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  {(!category.children || category.children.length === 0) && (
                    <li className="text-body-sm text-j-text-muted italic">No sub-categories</li>
                  )}
                </ul>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t border-j-outline-variant">
                <h4 className="text-body-sm font-bold mb-3 uppercase text-j-text-muted">Price (₦)</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-j-surface-container-lowest border border-j-outline-variant rounded px-3 py-2 text-body-sm focus:border-jumia-orange outline-none" 
                    />
                    <span className="text-j-text-muted">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-j-surface-container-lowest border border-j-outline-variant rounded px-3 py-2 text-body-sm focus:border-jumia-orange outline-none" 
                    />
                  </div>
                  <button 
                    onClick={handleSyncFilters}
                    className="w-full bg-jumia-orange text-white py-2 rounded text-label-bold font-bold hover:bg-jumia-orange-dark transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1">
          <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-headline-sm font-bold text-j-text">{category.name}</h1>
              <p className="text-body-sm text-j-text-muted">{products?.results?.length || 0} products found</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-j-text-muted">Sort by:</span>
              <select 
                value={initialSort}
                onChange={handleSortChange}
                className="bg-j-surface-container-low border border-j-outline-variant rounded px-3 py-1.5 text-body-sm font-medium outline-none cursor-pointer focus:border-jumia-orange"
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : products?.results && products.results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.results.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-j-surface-container-lowest rounded border border-j-outline-variant py-24 text-center px-4">
              <PackageSearch size={48} className="text-j-surface-container-high mx-auto mb-4" />
              <h3 className="text-headline-sm font-bold mb-2">No products found</h3>
              <p className="text-body-md text-j-text-muted mb-6">Try adjusting your filters or search for something else.</p>
              <Link href="/" className="bg-jumia-orange text-white px-8 py-3 rounded font-bold hover:bg-jumia-orange-dark transition-all">
                Continue Shopping
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

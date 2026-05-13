'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ProductCard } from '../../../../components/ui/ProductCard';
import { ChevronRight, Filter, SortAsc, ArrowRight, Layers, SlidersHorizontal, PackageSearch } from 'lucide-react';
import Link from 'next/link';

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
      sort: initialSort
    },
    { enabled: !!category?.id }
  );

  const handleSyncFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (minPrice) current.set('minPrice', minPrice);
    else current.delete('minPrice');
    
    if (maxPrice) current.set('maxPrice', maxPrice);
    else current.delete('maxPrice');

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/category/${slug}${query}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sort', e.target.value);
    router.push(`/category/${slug}?${current.toString()}`);
  };

  if (isCatLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container py-12 animate-pulse">
          <div className="h-4 w-48 bg-surface-container-low rounded-full mb-12" />
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-80 h-[600px] bg-surface-container-low rounded-[40px]" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[32px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center py-40 text-center px-8">
        <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center mb-10 border-4 border-surface-container-lowest shadow-soft">
          <PackageSearch size={40} className="text-on-surface-variant/20" />
        </div>
        <h1 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Null Category</h1>
        <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.4em] mt-4 mb-12 italic">The requested taxonomic node does not exist in our registry.</p>
        <Link href="/" className="px-12 py-5 bg-on-surface text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-24 select-none">
      {/* Breadcrumbs */}
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-10 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.3em]">
          <Link href="/" className="hover:text-primary-container transition-colors">Home</Link>
          <ChevronRight size={14} className="opacity-30" />
          <span className="text-on-surface">{category.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft overflow-hidden sticky top-24">
              <div className="p-8 border-b-2 border-surface-container-low flex items-center justify-between bg-surface-container-low/30">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={18} className="text-primary-container" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-on-surface">Precision Filters</h3>
                </div>
              </div>
              <div className="p-8 space-y-10">
                <div>
                  <h4 className="text-[9px] font-black uppercase text-on-surface-variant/40 tracking-[0.3em] mb-6 italic">Sub-Classifications</h4>
                  <ul className="space-y-3">
                    {category.children && category.children.length > 0 ? (
                      category.children.map((child: any) => (
                        <li key={child.id}>
                          <Link href={`/category/${child.slug}`} className="flex items-center justify-between text-xs font-black text-on-surface-variant hover:text-primary-container transition-all uppercase tracking-tight group">
                            {child.name}
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-[10px] text-on-surface-variant/20 italic font-black uppercase tracking-widest">No Sub-Nodes</li>
                    )}
                  </ul>
                </div>

                <div className="border-t-2 border-surface-container-low pt-8">
                  <h4 className="text-[9px] font-black uppercase text-on-surface-variant/40 tracking-[0.3em] mb-6 italic">Valuation (₦)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="MIN" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-surface-container-low/30 border-2 border-surface-container-low rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface focus:border-primary-container outline-none transition-all placeholder:font-normal placeholder:text-on-surface-variant/50" 
                    />
                    <input 
                      type="number" 
                      placeholder="MAX" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-surface-container-low/30 border-2 border-surface-container-low rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface focus:border-primary-container outline-none transition-all placeholder:font-normal placeholder:text-on-surface-variant/50" 
                    />
                  </div>
                  <button 
                    onClick={handleSyncFilters}
                    className="w-full mt-6 bg-on-surface text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl shadow-on-surface/10 hover:bg-primary-container transition-all active:scale-95"
                  >
                    Sync Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-soft">
              <div>
                <h1 className="text-3xl font-black text-on-surface uppercase tracking-tighter leading-none">{category.name}</h1>
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">{products?.results?.length || 0} Entities Indexed</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-surface-container-low/30 px-6 py-3 rounded-2xl border-2 border-surface-container-low">
                  <Filter size={16} className="text-on-surface-variant" />
                  <select 
                    value={initialSort}
                    onChange={handleSortChange}
                    className="bg-transparent font-black text-[10px] uppercase tracking-widest text-on-surface outline-none cursor-pointer"
                  >
                    <option value="RELEVANCE">RELEVANCE</option>
                    <option value="NEWEST">NEWEST ACQUISITIONS</option>
                    <option value="PRICE_LOW">LOWEST VALUATION</option>
                    <option value="PRICE_HIGH">HIGHEST VALUATION</option>
                    <option value="RATING">TRUST RATING</option>
                  </select>
                </div>
              </div>
            </div>

            {isProdLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-[32px] animate-pulse border-2 border-surface-container-lowest" />
                ))}
              </div>
            ) : products?.results && products.results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.results.map((product: any, idx: number) => (
                  <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low py-40 text-center px-8 shadow-soft">
                <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-surface-container-lowest">
                  <PackageSearch size={32} className="text-on-surface-variant/20" />
                </div>
                <h3 className="font-black text-2xl text-on-surface uppercase tracking-tighter">Inventory Void</h3>
                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.4em] mt-4 mb-10 italic">
                  No compatible products detected in the current node.
                </p>
                <Link href="/" className="inline-flex items-center gap-4 px-10 py-4 bg-on-surface text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">
                  Marketplace Hub
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

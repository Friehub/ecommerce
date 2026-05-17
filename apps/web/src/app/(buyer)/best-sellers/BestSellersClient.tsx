// apps/web/src/app/(buyer)/best-sellers/BestSellersClient.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Zap, Truck, Activity, BarChart3, Info } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function BestSellersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (pageParam - 1) * limit;

  const { data, isLoading } = api.catalog.listProducts.useQuery({
    limit,
    offset,
    sortBy: 'popularity' // Ensuring we show most popular items
  });

  if (isLoading) {
    return (
      <div className="bg-j-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-jumia-orange/20 border-t-jumia-orange rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-wider text-j-text-muted animate-pulse">Loading Bestsellers...</p>
        </div>
      </div>
    );
  }

  const products = data?.results || [];
  const totalItems = data?.total || 0;

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-j-text-muted uppercase tracking-tight">
          <Link href="/" className="hover:text-jumia-orange transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-j-text">Best Sellers</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-j-border shadow-sm overflow-hidden mb-6">
          <div className="bg-jumia-orange px-6 py-12 text-white relative">
            <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />
            <div className="max-w-xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-sm border border-white/10">
                  <Zap size={12} className="text-white" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-white">Top Selling</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-sm border border-white/10">
                  <Truck size={12} className="text-white" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-white">Fast Delivery</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">
                Best Sellers
              </h1>
              
              <p className="text-xs md:text-sm text-white/80 font-bold uppercase tracking-tight leading-relaxed">
                Discover our most popular products updated daily based on recent customer orders.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest text-white/90">
                <Activity size={12} className="animate-pulse" />
                Updated Daily
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-4 border-t border-j-border flex justify-between items-center bg-j-background text-j-text">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-jumia-orange" />
              <h2 className="text-[10px] font-black uppercase tracking-wider">Most Popular Products</h2>
            </div>
            <span className="text-[9px] font-black text-j-text-muted uppercase tracking-widest bg-white border border-j-border px-3 py-1 rounded-sm">
              Total Items: {totalItems}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: any, index: number) => (
                <div key={product.id} className="relative group bg-white border border-j-border shadow-sm overflow-hidden">
                  {/* Ranking Badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 bg-jumia-orange text-white rounded-sm flex items-center justify-center font-black text-xs z-30 border border-white shadow animate-in fade-in">
                    {offset + index + 1}
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {(() => {
              const totalPages = Math.ceil(totalItems / limit);
              if (totalPages <= 1) return null;
              return (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-j-border pt-6 animate-in fade-in">
                  <span className="text-[10px] font-black uppercase text-j-text-muted">
                    Showing {offset + 1}–{Math.min(offset + limit, totalItems)} of {totalItems} items
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        if (pageParam > 1) {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', (pageParam - 1).toString());
                          router.push(`${pathname}?${params.toString()}`);
                        }
                      }}
                      disabled={pageParam === 1}
                      className="h-9 px-3.5 border border-j-border rounded-sm text-[10px] font-black uppercase text-j-text hover:bg-j-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - pageParam) <= 2)
                      .map((pageNum, idx, arr) => {
                        const showEllipsis = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsis && (
                              <span className="px-2 text-xs font-bold text-j-text-muted select-none">...</span>
                            )}
                            <button
                              onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', pageNum.toString());
                                router.push(`${pathname}?${params.toString()}`);
                              }}
                              className={`w-9 h-9 rounded-sm flex items-center justify-center text-[10px] font-black transition-all ${
                                pageNum === pageParam
                                  ? 'bg-jumia-orange text-white shadow'
                                  : 'border border-j-border text-j-text hover:bg-j-background'
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    <button
                      onClick={() => {
                        if (pageParam < totalPages) {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', (pageParam + 1).toString());
                          router.push(`${pathname}?${params.toString()}`);
                        }
                      }}
                      disabled={pageParam === totalPages}
                      className="h-9 px-3.5 border border-j-border rounded-sm text-[10px] font-black uppercase text-j-text hover:bg-j-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="bg-white border border-j-border shadow-sm p-12 text-center rounded-sm max-w-xl mx-auto space-y-4">
            <Info className="mx-auto text-j-text-muted opacity-40 animate-pulse" size={48} />
            <h2 className="text-body-lg font-black text-j-text uppercase tracking-tight">No products found</h2>
            <p className="text-j-text-muted text-body-xs font-bold uppercase tracking-tight max-w-sm mx-auto">
              We couldn't load any popular items right now. Please explore other parts of our store.
            </p>
            <Link 
              href="/" 
              className="inline-flex h-10 px-6 bg-jumia-orange text-white text-body-xs font-black uppercase tracking-wider items-center justify-center rounded-sm shadow hover:bg-orange-600 transition-all active:scale-95"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

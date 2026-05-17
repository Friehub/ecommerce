// apps/web/src/app/(buyer)/jumia-express/JumiaExpressClient.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Truck, ArrowRight, PackageCheck, Timer } from 'lucide-react';
import { api } from '@/trpc/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function JumiaExpressClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (pageParam - 1) * limit;

  const { data, isLoading } = api.catalog.listProducts.useQuery({
    limit,
    offset,
    isExpress: true // Filter for fast-fulfillment products
  });

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
          <p className="text-[10px] font-semibold uppercase text-on-surface-variant opacity-40 animate-pulse">Syncing Local Warehouses</p>
        </div>
      </div>
    );
  }

  const products = data?.results || [];
  const totalItems = data?.total || 0;

  return (
    <div className="bg-background min-h-screen pb-24 select-none">
      {/* Hero Header */}
      <div className="bg-jumia-orange text-white py-24 md:py-32 relative overflow-hidden">
        {/* Background Visual */}
        <div className="absolute inset-0 opacity-20 grayscale transition-all duration-1000">
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200" className="w-full h-full object-cover" alt="Logistics" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface to-transparent z-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-jumia-orange/20 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3 z-20" />
        
        <div className="container relative z-30 mx-auto px-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
                <Zap size={18} className="text-jumia-orange fill-primary-container" />
                <span className="text-[10px] font-semibold uppercase text-white">Express Protocol</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-2xl px-6 py-3 rounded-2xl border-2 border-white/10 transition-all hover:bg-white/10 shadow-2xl">
                <Timer size={18} className="text-jumia-orange" />
                <span className="text-[10px] font-semibold uppercase text-white">&lt; 24H Fulfillment</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-semibold uppercase tracking-tighter leading-[0.85] mb-8">
              Fast <br />
              <span className="text-jumia-orange">Execution</span>
            </h1>
            
            <p className="text-sm md:text-lg text-white/40 font-semibold uppercase tracking-widest leading-relaxed max-w-xl mb-12 italic">
              IN-HOUSE WAREHOUSING. MULTI-POINT QUALITY INSPECTION. PRIORITY DISPATCH SEQUENCE ENABLED.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b-4 border-surface-container-low pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <PackageCheck size={24} className="text-jumia-orange" />
              <h2 className="text-[10px] font-semibold text-jumia-orange uppercase">Inventory Status</h2>
            </div>
            <h2 className="text-4xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Ready for <span className="text-jumia-orange">Dispatch</span></h2>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-semibold uppercase text-on-surface-variant/40 italic">
            <span className="px-4 py-2 bg-surface-container-low rounded-xl border-2 border-surface-container-low text-on-surface">Verified Nodes: {totalItems}</span>
            <span className="hidden md:inline">Tier-1 Fulfillment Hub Active</span>
          </div>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
              {products.map((product: any, index: number) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {(() => {
              const totalPages = Math.ceil(totalItems / limit);
              if (totalPages <= 1) return null;
              return (
                <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-container-low pt-8">
                  <span className="text-[10px] font-semibold uppercase text-on-surface-variant/60 tracking-wider">
                    Showing {offset + 1}–{Math.min(offset + limit, totalItems)} of {totalItems} items
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        if (pageParam > 1) {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', (pageParam - 1).toString());
                          router.push(`${pathname}?${params.toString()}`);
                        }
                      }}
                      disabled={pageParam === 1}
                      className="h-10 px-4 border border-surface-container-low rounded bg-white text-[10px] font-semibold uppercase hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center animate-all"
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
                              <span className="px-2 text-xs font-semibold text-on-surface-variant/40 select-none">...</span>
                            )}
                            <button
                              onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('page', pageNum.toString());
                                router.push(`${pathname}?${params.toString()}`);
                              }}
                              className={`w-10 h-10 rounded flex items-center justify-center text-[10px] font-semibold transition-all ${
                                pageNum === pageParam
                                  ? 'bg-jumia-orange text-white shadow'
                                  : 'border border-surface-container-low bg-white hover:bg-surface-container-low'
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
                      className="h-10 px-4 border border-surface-container-low rounded bg-white text-[10px] font-semibold uppercase hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center animate-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low p-24 text-center shadow-soft">
            <Zap className="mx-auto text-surface-container-low mb-10" size={80} />
            <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Replenishing <span className="text-jumia-orange">Node</span></h2>
            <p className="text-on-surface-variant/40 text-[11px] max-w-sm mx-auto mb-12 font-semibold uppercase leading-relaxed italic">
              LOGISTICS NETWORK IS CURRENTLY REPLENISHING HIGH-VELOCITY STOCK. CHECK BACK FOR IMMEDIATE FULFILLMENT NODES.
            </p>
            <Link href="/" className="h-20 px-16 bg-jumia-orange text-white rounded-3xl font-semibold text-[10px] uppercase hover:bg-jumia-orange-dark transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4 mx-auto w-fit">
              Browse Universal Store
            </Link>
          </div>
        )}

        {/* Express Benefits */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { title: 'Hub Stocked', desc: 'INSTANT ACCESS. ITEMS ARE PHYSICALLY SECURED WITHIN OUR TIER-1 WAREHOUSING NETWORK.', icon: <Zap size={32} /> },
            { title: 'Priority Chain', desc: 'EXPRESS PACKAGES BYPASS STANDARD PROCESSING QUEUES FOR IMMEDIATE COURIER ASSIGNMENT.', icon: <Truck size={32} /> },
            { title: 'Quality Logic', desc: 'SYSTEMIC MULTI-POINT INSPECTION PROTOCOL GUARANTEES ZERO-DEFECT DISPATCH.', icon: <ShieldCheck size={32} /> }
          ].map((benefit, i) => (
            <div key={i} className="bg-surface-container-lowest p-10 rounded border border-surface-container-low shadow-soft hover:border-jumia-orange/20 transition-all duration-500 group">
              <div className="text-jumia-orange mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-on-surface uppercase tracking-tighter mb-4">{benefit.title}</h3>
              <p className="text-[10px] font-semibold text-on-surface-variant/40 leading-relaxed uppercase tracking-widest italic">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

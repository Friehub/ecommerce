'use client';

import { api as trpc } from "@/trpc/react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShoppingBag, ShieldCheck, Activity, ArrowRight, Package, Grid } from 'lucide-react';

export default function SellerStorefrontPage({ params }: { params: { sellerId: string } }) {
  return (
    <SellerStorefrontContent sellerId={params.sellerId} />
  );
}

function SellerStorefrontContent({ sellerId }: { sellerId: string }) {
  const { data: seller, isLoading: sellerLoading, error: sellerError } = trpc.iam.getPublicProfile.useQuery({ idOrSlug: sellerId });
  const { data: productsData, isLoading: productsLoading } = trpc.catalog.getSellerProducts.useQuery({ sellerId });

  if (sellerLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border border-jumia-orange/20 border-t-jumia-orange rounded-full animate-spin" />
          <p className="text-[10px] font-semibold uppercase text-j-text-muted opacity-60 animate-pulse">Loading store...</p>
        </div>
      </div>
    );
  }

  if (sellerError || !seller) return notFound();

  return (
    <div className="bg-j-background min-h-screen pb-24 select-none">
      <div className="container py-12 max-w-7xl mx-auto px-6">
        {/* Store Header */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm p-10 md:p-16 mb-16 flex flex-col md:flex-row items-center gap-12 animate-in fade-in slide-in-from-top-8 duration-1000 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="w-32 h-32 bg-jumia-orange text-white rounded flex items-center justify-center text-5xl font-black shadow-2xl relative z-10 shrink-0 border border-white/10">
            {seller.businessName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-black text-j-text uppercase tracking-tighter leading-none">{seller.businessName}</h1>
              <span className="bg-jumia-orange text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-md w-fit mx-auto md:mx-0 border-2 border-white/10 tracking-widest">
                {(seller.tier as string) === 'BRAND' ? 'Official Brand' : (seller.tier as string) === 'EXPRESS' ? 'Jumia Express' : 'Standard Seller'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black text-j-text-muted uppercase tracking-wider">
              <div className="flex items-center gap-2 px-4 py-2 bg-j-background rounded-full border border-j-border">
                <Star size={16} className="text-jumia-orange fill-jumia-orange" />
                <span className="text-j-text">{Number(seller.rating ?? 0).toFixed(1)}</span>
                <span className="opacity-40">(VERIFIED)</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-jumia-orange" />
                <span>MEMBER SINCE {format(new Date(seller.memberSince), 'MMM yyyy').toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-j-success" />
                <span className="text-j-success">VERIFIED VENDOR</span>
              </div>
            </div>
          </div>
          <div className="bg-j-background px-10 py-8 rounded-sm border border-j-border text-center shrink-0 min-w-[180px] shadow-inner">
            <div className="text-4xl font-black text-j-text tracking-tighter leading-none mb-2">{seller.productCount}</div>
            <div className="text-[9px] text-j-text-muted uppercase font-black tracking-widest">Active Products</div>
          </div>
        </div>

        {/* Product Grid Header */}
        <div className="flex items-center gap-4 mb-12 border-b border-j-border pb-8">
          <Grid size={24} className="text-jumia-orange" />
          <h2 className="text-3xl font-black text-j-text uppercase tracking-tighter">Vendor <span className="text-jumia-orange">Store</span></h2>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-j-background rounded-sm animate-pulse border border-j-border" />
            ))}
          </div>
        ) : productsData?.results?.length === 0 ? (
          <div className="bg-white rounded-sm border border-j-border p-32 text-center shadow-sm animate-in zoom-in-95 duration-1000">
            <Package className="mx-auto text-j-text-muted mb-10 opacity-20" size={80} />
            <h3 className="text-3xl font-black text-j-text uppercase tracking-tighter mb-4">No <span className="text-jumia-orange">Products</span></h3>
            <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-sm mx-auto">This seller hasn't listed any products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {productsData?.results?.map((product: any, idx: number) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="bg-white rounded-sm border border-j-border overflow-hidden hover:border-jumia-orange/40 transition-all duration-500 shadow-sm group animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="aspect-square relative bg-j-background overflow-hidden">
                  {product.media?.[0] ? (
                    <Image 
                      src={product.media[0].url} 
                      alt={product.title}
                      fill
                      sizes="200px"
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-j-text-muted opacity-20">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-jumia-orange text-white p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <ArrowRight size={16} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xs font-black text-j-text uppercase tracking-tight line-clamp-2 min-h-[36px] mb-4 group-hover:text-jumia-orange transition-colors leading-tight">{product.title}</h3>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-black text-j-text tracking-tight">₦{product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="text-[9px] text-j-text-muted line-through font-bold uppercase tracking-wider">₦{product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Buyer Protection Widget */}
        <div className="mt-24 bg-jumia-orange text-white rounded-sm p-10 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange-dark/10 rounded-full blur-[120px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white/10 rounded-sm flex items-center justify-center border border-white/10">
                <ShieldCheck size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Buyer <span className="text-white">Protection</span></h3>
                <p className="text-[10px] font-black uppercase tracking-wider opacity-90 max-w-xl leading-loose">
                  All purchases are protected by secure payment systems and our simple 7-day return policy.
                </p>
              </div>
            </div>
            <button className="h-12 px-8 bg-white text-jumia-orange rounded-sm font-black text-[10px] uppercase hover:bg-orange-50 transition-all active:scale-95 shadow-md shrink-0">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

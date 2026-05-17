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
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant opacity-40 animate-pulse">Syncing Vendor Node</p>
 </div>
 </div>
 );
 }

 if (sellerError || !seller) return notFound();

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6">
 {/* Store Header */}
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low shadow-soft p-10 md:p-16 mb-16 flex flex-col md:flex-row items-center gap-12 animate-in fade-in slide-in-from-top-8 duration-1000 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange/5 rounded-full blur-[100px] -mr-32 -mt-32" />
 
 <div className="w-32 h-32 bg-jumia-orange text-white rounded flex items-center justify-center text-5xl font-semibold shadow-2xl relative z-10 shrink-0 border border-white/10">
 {seller.businessName.charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 text-center md:text-left relative z-10">
 <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
 <h1 className="text-4xl md:text-5xl font-semibold text-on-surface uppercase tracking-tighter leading-none">{seller.businessName}</h1>
 <span className="bg-jumia-orange text-white px-4 py-1.5 rounded-full text-[9px] font-semibold uppercase  shadow-xl w-fit mx-auto md:mx-0 border-2 border-white/10">
 {seller.tier} NODE
 </span>
 </div>
 <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-semibold text-on-surface-variant/40 uppercase  italic">
 <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl border-2 border-surface-container-low">
 <Star size={16} className="text-jumia-orange fill-primary-container" />
 <span className="text-on-surface">{Number(seller.rating ?? 0).toFixed(1)}</span>
 <span className="opacity-40">(VERIFIED)</span>
 </div>
 <div className="flex items-center gap-2">
 <Activity size={16} className="text-jumia-orange" />
 <span>MEMBER SINCE {format(new Date(seller.memberSince), 'MMM yyyy').toUpperCase()}</span>
 </div>
 <div className="flex items-center gap-2">
 <ShieldCheck size={16} className="text-success" />
 <span className="text-success">VERIFIED VENDOR</span>
 </div>
 </div>
 </div>
 <div className="bg-surface-container-low/30 px-10 py-8 rounded border border-surface-container-low text-center shrink-0 min-w-[180px] shadow-inner">
 <div className="text-4xl font-semibold text-on-surface tracking-tighter leading-none mb-2">{seller.productCount}</div>
 <div className="text-[9px] text-on-surface-variant/40 uppercase font-semibold  italic">Active Nodes</div>
 </div>
 </div>

 {/* Product Grid Header */}
 <div className="flex items-center gap-4 mb-12 border-b-4 border-surface-container-low pb-8">
 <Grid size={24} className="text-jumia-orange" />
 <h2 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter">Vendor <span className="text-jumia-orange">Inventory</span></h2>
 </div>
 
 {productsLoading ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
 {[...Array(10)].map((_, i) => (
 <div key={i} className="aspect-[3/4] bg-surface-container-low/30 rounded animate-pulse border-2 border-surface-container-low" />
 ))}
 </div>
 ) : productsData?.results?.length === 0 ? (
 <div className="bg-surface-container-lowest rounded-[56px] border border-surface-container-low p-32 text-center shadow-soft animate-in zoom-in-95 duration-1000">
 <Package className="mx-auto text-surface-container-low mb-10 opacity-40" size={80} />
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter mb-4">Inventory <span className="text-jumia-orange">Null</span></h3>
 <p className="text-on-surface-variant/40 text-[10px] font-semibold uppercase  italic leading-relaxed max-w-sm mx-auto">NO ACTIVE PRODUCTS DETECTED WITHIN THIS VENDOR'S SYSTEMIC CATALOG.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
 {productsData?.results?.map((product: any, idx: number) => (
 <Link 
 key={product.id} 
 href={`/products/${product.slug}`}
 className="bg-surface-container-lowest rounded border border-surface-container-low overflow-hidden hover:border-jumia-orange/20 transition-all duration-500 shadow-soft group animate-in fade-in slide-in-from-bottom-8 duration-700"
 style={{ animationDelay: `${idx * 50}ms` }}
 >
 <div className="aspect-square relative bg-surface-container-low/30 overflow-hidden">
 {product.media?.[0] ? (
 <Image 
 src={product.media[0].url} 
 alt={product.title}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-1000 p-6"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
 <ShoppingBag size={48} />
 </div>
 )}
 <div className="absolute top-4 right-4 bg-jumia-orange/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
 <ArrowRight size={16} className="text-white" />
 </div>
 </div>
 <div className="p-8">
 <h3 className="text-sm font-semibold text-on-surface uppercase tracking-tighter line-clamp-2 min-h-[40px] mb-6 group-hover:text-jumia-orange transition-colors leading-tight">{product.title}</h3>
 <div className="flex items-baseline justify-between">
 <span className="text-xl font-semibold text-on-surface tracking-tighter">₦{product.price.toLocaleString()}</span>
 {product.comparePrice && (
 <span className="text-[10px] text-on-surface-variant/40 line-through font-semibold uppercase tracking-widest">₦{product.comparePrice.toLocaleString()}</span>
 )}
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}
 
 <div className="mt-24 bg-jumia-orange text-white rounded p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-jumia-orange/20 rounded-full blur-[120px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000" />
 <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center border-2 border-white/10">
 <ShieldCheck size={40} className="text-jumia-orange" />
 </div>
 <div>
 <h3 className="text-2xl font-semibold uppercase tracking-tighter mb-2">Vendor <span className="text-jumia-orange">Integrity</span></h3>
 <p className="text-[10px] font-semibold uppercase  italic opacity-40 max-w-xl leading-loose">
 EVERY ACQUISITION FROM THIS NODE IS PROTECTED BY JUMIA CENTRAL COMMAND SETTLEMENT PROTOCOLS AND RETURN GUARANTEES.
 </p>
 </div>
 </div>
 <button className="h-16 px-10 bg-jumia-orange text-white rounded-2xl font-semibold text-[10px] uppercase  hover:bg-white hover:text-on-surface transition-all active:scale-95 shadow-xl shadow-primary-container/20 shrink-0">
 Systemic Message
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

import { api } from '@/trpc/server';
import { Package, ShoppingCart, Star, ArrowRight, Activity, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';

export default async function ProductsPage({
 searchParams,
}: {
 searchParams: Promise<{ category?: string; brand?: string; q?: string }>;
}) {
 const sp = await searchParams;
 const { results: products } = await api.catalog.listProducts.query({
 categoryId: sp.category,
 brandId: sp.brand,
 search: sp.q,
 });

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6 space-y-12">
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-surface-container-low pb-12">
 <div className="animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-6 mb-4">
 <div className="w-16 h-16 bg-primary-container/10 border-4 border-primary-container/20 rounded-[24px] flex items-center justify-center text-primary-container shadow-2xl shadow-primary-container/5">
 <Grid size={32} strokeWidth={2.5} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter leading-none">Global <span className="text-primary-container">Catalog</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Querying verified inventory from the central fulfillment grid.</p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <button className="h-14 px-8 bg-surface-container-low border-2 border-surface-container-low rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:border-primary-container/20 transition-all">
 <Filter size={16} /> Filter Nodes
 </button>
 <div className="flex items-center gap-2 bg-surface-container-low/30 px-6 py-4 rounded-[20px] border-2 border-surface-container-low">
 <Activity size={16} className="text-primary-container animate-pulse" />
 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">{products.length} Units Found</span>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
 {products.map((product, idx) => (
 <div 
 key={product.id} 
 className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden group hover:shadow-2xl hover:border-primary-container/20 transition-all duration-700 animate-in fade-in slide-in-from-bottom-8"
 style={{ animationDelay: `${idx * 50}ms` }}
 >
 <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-surface-container-low">
 <div className="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-5 transition-opacity z-10" />
 {product.media[0] ? (
 <img 
 src={product.media[0].url} 
 alt={product.title} 
 className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" 
 />
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
 <Package size={64} strokeWidth={1} />
 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Asset Null</span>
 </div>
 )}
 
 {/* Status Badges */}
 <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
 <div className="bg-on-surface text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md border border-white/10">
 NEW BATCH
 </div>
 {idx % 3 === 0 && (
 <div className="bg-primary-container text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-2xl border border-white/10">
 TRENDING
 </div>
 )}
 </div>
 </Link>
 
 <div className="p-8 space-y-6">
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-primary-container">
 <Star size={12} fill="currentColor" />
 <span className="text-[9px] font-black uppercase tracking-[0.3em]">4.9 Diagnostic Rating</span>
 </div>
 <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter truncate group-hover:text-primary-container transition-colors">
 {product.title}
 </h2>
 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] italic">SKU: {product.id.slice(-8).toUpperCase()}</p>
 </div>

 <div className="flex items-end justify-between gap-4 pt-4 border-t-2 border-surface-container-low">
 <div className="space-y-1">
 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] italic">Current Magnitude</p>
 <p className="text-2xl font-black text-primary-container tracking-tighter">
 ₦{product.variants[0]?.price.toLocaleString()}
 </p>
 </div>
 <Link 
 href={`/products/${product.slug}`}
 className="w-14 h-14 bg-on-surface text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-primary-container transition-all active:scale-90 group/btn"
 >
 <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
 </Link>
 </div>
 </div>
 </div>
 ))}
 </div>

 {products.length === 0 && (
 <div className="py-40 text-center animate-in zoom-in-95 duration-1000">
 <div className="w-24 h-24 bg-surface-container-low rounded-[40px] flex items-center justify-center mx-auto mb-10 border-4 border-surface-container-low">
 <Package size={48} className="text-on-surface-variant/20" />
 </div>
 <h3 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Catalog Empty</h3>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.5em] mt-6 italic">NO ASSETS MATCHING YOUR CURRENT SEARCH PARAMETERS WERE DETECTED.</p>
 </div>
 )}
 </div>
 </div>
 );
}

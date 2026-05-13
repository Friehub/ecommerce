import { api } from '@/trpc/server';
import { notFound } from "next/navigation";
import { ProductGallery } from "../../../../components/products/ProductGallery";
import { ProductActions } from "../../../../components/products/ProductActions";
import { ProductReviews } from "../../../../components/products/ProductReviews";
import { ChevronRight, Star, Share2, MapPin, ShieldCheck, ChevronLeft, ArrowRight, ShoppingBag } from "lucide-react";
import Link from 'next/link';

export default async function ProductDetailPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const product = await api.catalog.getProductBySlug.query({ slug });

 if (!product) {
 notFound();
 }

 const primaryVariant = product.variants?.[0];
 const price = Number(product.price ?? primaryVariant?.price ?? 0);

 return (
 <div className="bg-background min-h-screen pb-32 relative">
 {/* Breadcrumbs with Fade Mask */}
 <div className="bg-surface-container-low border-b border-outline-variant/30 select-none sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
 <div className="container py-4 flex items-center gap-3 whitespace-nowrap overflow-x-auto scrollbar-hide relative group">
 <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-all">Hub</Link>
 <ChevronRight size={12} className="text-on-surface-variant opacity-20" />
 <Link href={`/category/${product.category.slug}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary-container transition-all">{product.category.name}</Link>
 <ChevronRight size={12} className="text-on-surface-variant opacity-20" />
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface truncate max-w-[150px] md:max-w-none italic opacity-60">{product.title}</span>
 <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-surface-container-low to-transparent pointer-events-none" />
 </div>
 </div>

 <main className="container py-8 lg:py-12">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="flex flex-col lg:flex-row p-8 lg:p-12 gap-12 lg:gap-16">
 {/* Left: Gallery */}
 <div className="w-full lg:w-1/2">
 <ProductGallery images={product.media} />
 </div>

 {/* Right: Info & Actions */}
 <div className="flex-1 flex flex-col gap-8">
 <div className="flex justify-between items-start gap-6">
 <div className="space-y-4">
 <div className="flex flex-wrap items-center gap-3 select-none">
 <span className="bg-primary-container/10 border-2 border-primary-container/20 text-primary-container text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">
 Official Repository
 </span>
 <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] hover:underline cursor-pointer opacity-60 italic">{product.brand.name}</p>
 </div>
 <h1 className="text-3xl md:text-5xl font-black text-on-surface leading-[1.1] tracking-tighter uppercase">
 {product.title}
 </h1>
 </div>
 <button className="p-4 bg-surface-container-low hover:bg-primary-container hover:text-white border-2 border-outline-variant/10 rounded-[20px] transition-all duration-500 cursor-pointer group shadow-soft active:scale-90">
 <Share2 size={20} className="text-on-surface-variant group-hover:text-white" />
 </button>
 </div>

 {/* Rating */}
 <div className="flex items-center gap-4 border-b-2 border-outline-variant/30 pb-8 select-none">
 <div className="flex gap-1 text-primary-container">
 {[...Array(5)].map((_, i) => (
 <Star 
 key={i} 
 size={16} 
 fill={i < Math.round(product.averageRating || 0) ? "currentColor" : "none"} 
 className={i < Math.round(product.averageRating || 0) ? "text-primary-container drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "text-outline-variant opacity-20"} 
 />
 ))}
 </div>
 <span className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] hover:underline cursor-pointer opacity-60">
 [{product.reviewCount || 0} LOGGED REVIEWS]
 </span>
 </div>

 <ProductActions product={product} />
 </div>

 {/* Delivery & Seller (Desktop Sidebar) */}
 <div className="w-full lg:w-[320px] space-y-6 select-none hidden lg:block">
 <div className="bg-surface-container-low/50 border-2 border-outline-variant/30 rounded-[32px] p-8 hover:border-primary-container/20 hover:shadow-2xl transition-all duration-500 group">
 <h4 className="text-[10px] font-black uppercase text-on-surface-variant mb-6 tracking-[0.3em] flex items-center gap-3">
 <MapPin size={18} className="text-primary-container group-hover:animate-bounce" /> Logistics Node
 </h4>
 <div className="space-y-6">
 <div className="flex gap-4 items-center">
 <div className="text-primary-container bg-surface-container-lowest p-3 rounded-2xl border-2 border-outline-variant/10 shadow-soft">
 <Truck size={20} strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-xs font-black text-on-surface uppercase tracking-tight">Standard Distribution</p>
 <p className="text-[9px] font-black text-primary-container cursor-pointer hover:underline uppercase tracking-widest mt-1 opacity-60 italic">Regional Center: Lagos</p>
 </div>
 </div>
 <div className="bg-primary-container/5 border-2 border-primary-container/10 p-5 rounded-2xl text-[10px] text-on-surface-variant font-black leading-relaxed uppercase tracking-widest italic opacity-80">
 <strong className="text-primary-container">COMPLIMENTARY LOGISTICS</strong> applied to primary acquisition phase.
 </div>
 </div>
 </div>

 <div className="bg-on-surface text-white rounded-[32px] p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
 <h4 className="text-[10px] font-black uppercase text-white/40 mb-6 tracking-[0.3em] relative z-10 flex items-center gap-3">
 <ShieldCheck size={18} className="text-primary-container" /> Provider ID
 </h4>
 <div className="space-y-2 relative z-10 pb-4">
 <p className="text-lg font-black text-white uppercase tracking-tighter leading-none">{product.seller.businessName || "Verified Merchant"}</p>
 <p className="text-[9px] font-black text-success uppercase tracking-[0.3em] mt-2 italic">98% Reliability Index</p>
 </div>
 <button className="w-full mt-6 bg-white/10 hover:bg-primary-container text-white py-4 rounded-2xl text-[10px] font-black uppercase transition-all tracking-[0.3em] select-none border-2 border-white/5 relative z-10 active:scale-95">
 Follow Node
 </button>
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
 {/* Product Details Section */}
 <div className="lg:col-span-2 space-y-8">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
 <h3 className="text-xl font-black mb-8 border-b-2 border-outline-variant/30 pb-6 text-on-surface uppercase tracking-tighter">Technical Specifications</h3>
 <div className="prose prose-on-surface max-w-none text-on-surface-variant font-bold leading-relaxed whitespace-pre-wrap select-none text-sm opacity-80 italic">
 {product.description}
 </div>
 </div>

 {/* Specifications Grid */}
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
 <h3 className="text-xl font-black mb-8 border-b-2 border-outline-variant/30 pb-6 text-on-surface uppercase tracking-tighter">Internal Parameters</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 select-none">
 {Object.entries(product.variants[0]?.attributes || {}).map(([key, value]) => (
 <div key={key} className="flex justify-between border-b border-outline-variant/10 py-4 text-[10px] uppercase tracking-widest font-black group">
 <span className="text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
 <span className="text-on-surface">{value as string}</span>
 </div>
 ))}
 <div className="flex justify-between border-b border-outline-variant/10 py-4 text-[10px] uppercase tracking-widest font-black group">
 <span className="text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">Mass Matrix (g)</span>
 <span className="text-on-surface">{product.variants[0]?.weightGrams || "NULL"}</span>
 </div>
 <div className="flex justify-between border-b border-outline-variant/10 py-4 text-[10px] uppercase tracking-widest font-black group">
 <span className="text-on-surface-variant opacity-40 group-hover:opacity-100 transition-opacity">Protocol SKU</span>
 <span className="text-primary-container">{product.variants[0]?.sku}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Right Column: Reviews & Mobile Fallbacks */}
 <div className="space-y-8 lg:mt-0 mt-8">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-8 lg:p-10 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
 <ProductReviews productId={product.id} />
 </div>
 </div>
 </div>
 </main>

 {/* Mobile Sticky Price Bar */}
 <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-on-surface text-white p-6 border-t-4 border-primary-container shadow-[0_-20px_40px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-full duration-700">
 <div className="container flex items-center justify-between gap-6 max-w-lg mx-auto">
 <div className="flex flex-col">
 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-container mb-1 italic opacity-80">Total Value</span>
 <span className="text-2xl font-black tracking-tighter leading-none">₦ {price.toLocaleString()}</span>
 </div>
 <button className="flex-1 bg-primary-container text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary-container/20 group">
 Acquire Now
 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
 </button>
 </div>
 </div>
 </div>
 );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, StarHalf, Activity, Box } from 'lucide-react';
import { ProductStatusBadge } from './ProductStatusBadge';

interface ProductCardProps {
 product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
 const primaryVariant = product.variants?.[0];
 const price = Number(product.price ?? primaryVariant?.price ?? 0);
 const comparePrice = product.comparePrice ? Number(product.comparePrice) : (primaryVariant?.comparePrice ? Number(primaryVariant.comparePrice) : undefined);
 const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
 const savings = comparePrice && comparePrice > price ? comparePrice - price : 0;
 
 const inventory = primaryVariant?.inventory ?? product.inventory ?? 0;

 const renderStars = (rating: number) => {
 const stars = [];
 const fullStars = Math.floor(rating);
 const hasHalfStar = rating % 1 >= 0.5;

 for (let i = 0; i < 5; i++) {
 if (i < fullStars) {
 stars.push(<Star key={i} size={8} className="fill-primary-container text-primary-container" />);
 } else if (i === fullStars && hasHalfStar) {
 stars.push(<StarHalf key={i} size={8} className="fill-primary-container text-primary-container" />);
 } else {
 stars.push(<Star key={i} size={8} className="text-outline-variant fill-outline-variant/30" />);
 }
 }
 return stars;
 };

 const imageUrl = product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

 return (
 <Link 
 href={`/products/${product.slug}`} 
 className="flex flex-col h-full group bg-surface-container-lowest p-3 rounded-[32px] border-4 border-surface-container-low hover:border-primary-container/20 hover:shadow-2xl transition-all duration-700 overflow-hidden relative"
 >
 <div className="relative aspect-square mb-6 bg-surface-container-low/50 rounded-[24px] overflow-hidden flex items-center justify-center p-4">
 <Image 
 src={imageUrl}
 alt={product.title}
 fill
 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
 className="object-contain p-6 transition-transform duration-[1.5s] group-hover:scale-110"
 priority={false}
 />
 
 {/* Badges Overlay */}
 <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
 {product.isExpress && <ProductStatusBadge type="EXPRESS" />}
 {product.isOfficial && <ProductStatusBadge type="OFFICIAL" />}
 </div>

 {discount > 0 && (
 <div className="absolute top-4 right-4 bg-error text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 z-10">
 -{discount}%
 </div>
 )}
 </div>
 
 <div className="flex flex-col flex-1 px-2 pb-2">
 {/* Top Metadata */}
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-2">
 <div className={`w-1.5 h-1.5 rounded-full ${inventory > 0 ? 'bg-success' : 'bg-error'} animate-pulse`} />
 <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${inventory > 0 ? 'text-success' : 'text-error'} opacity-80`}>
 {inventory > 10 ? 'NOMINAL' : inventory > 0 ? `CRITICAL (${inventory})` : 'VOID'}
 </span>
 </div>
 <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] italic">
 {product.brand?.name || 'GENUINE'}
 </span>
 </div>

 <h3 className="text-sm font-semibold text-on-surface line-clamp-2 mb-4 leading-snug tracking-tight group-hover:text-primary-container transition-colors min-h-[40px] uppercase">
 {product.title}
 </h3>
 
 {/* Ratings & Telemetry */}
 <div className="flex items-center justify-between mb-6 pt-4 border-t border-surface-container-low">
 <div className="flex items-center gap-1">
 {renderStars(Number(product.averageRating || 0))}
 <span className="text-[8px] font-black text-on-surface-variant/40 uppercase ml-1">({product.reviewCount || 0})</span>
 </div>
 <div className="flex items-center gap-1.5 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">
 <Activity size={10} className="text-primary-container" />
 LIVE SYNC
 </div>
 </div>
 
 <div className="mt-auto space-y-4">
 <div className="flex flex-col gap-0.5">
 <div className="flex items-end justify-between">
 <span className="text-xl font-black text-on-surface tracking-tighter leading-none group-hover:text-primary-container transition-colors">
 ₦ {price.toLocaleString()}
 </span>
 <div className="bg-surface-container-low p-2 rounded-xl group-hover:bg-primary-container group-hover:text-white transition-all">
 <Box size={14} />
 </div>
 </div>
 {comparePrice && comparePrice > price && (
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[10px] text-on-surface-variant line-through font-bold opacity-40">
 ₦ {comparePrice.toLocaleString()}
 </span>
 <span className="text-[8px] font-black text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-lg border border-primary-container/20">
 SAVE ₦{savings.toLocaleString()}
 </span>
 </div>
 )}
 </div>
 </div>
 </div>
 </Link>
 );
};

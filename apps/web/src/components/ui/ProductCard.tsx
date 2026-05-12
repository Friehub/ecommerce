'use client';

import Image from 'next/image';
import { Star, StarHalf } from 'lucide-react';
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
      className="flex flex-col h-full group bg-surface-container-lowest p-3 rounded-[28px] border-2 border-outline-variant/30 hover:border-primary-container/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
    >
      <div className="relative aspect-square mb-4 bg-surface-container-low rounded-[20px] overflow-hidden flex items-center justify-center p-4">
        <Image 
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-[1.5s] group-hover:scale-110"
          priority={false}
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isExpress && <ProductStatusBadge type="EXPRESS" />}
          {product.isOfficial && <ProductStatusBadge type="OFFICIAL" />}
        </div>

        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-error text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl shadow-xl shadow-error/30 animate-pulse">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 px-1">
        {/* Brand & Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-sm font-black text-primary-container uppercase tracking-[0.3em] truncate max-w-[70%] italic opacity-80">
            {product.brand?.name || 'GENUINE PRODUCT'}
          </span>
          {product.isGlobal && <ProductStatusBadge type="GLOBAL" />}
        </div>

        <h3 className="text-sm font-semibold text-on-surface line-clamp-2 mb-3 leading-snug tracking-tight group-hover:text-primary-container transition-colors h-10">
          {product.title}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {renderStars(Number(product.averageRating || 0))}
          </div>
          <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">({product.reviewCount || 0})</span>
        </div>
        
        <div className="mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-black text-on-surface tracking-tighter leading-none">
              ₦ {price.toLocaleString()}
            </span>
            {comparePrice && comparePrice > price && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant line-through font-bold opacity-50">
                  ₦ {comparePrice.toLocaleString()}
                </span>
                <span className="text-[8px] font-black text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-lg border border-primary-container/20">
                  SAVE ₦{savings.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {product.isFlashSale && (
            <div className="mt-5 space-y-2">
              <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/30">
                <div 
                  className="h-full bg-error rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.4)]" 
                  style={{ width: `${(product.itemsLeft / (product.itemsLeft + 20)) * 100}%` }}
                />
              </div>
              <p className="text-[8px] font-black text-error uppercase tracking-[0.2em] italic">
                Hurry! {product.itemsLeft || 10} Units Left
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};


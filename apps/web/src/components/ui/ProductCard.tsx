// apps/web/src/components/ui/ProductCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    price: number;
    originalPrice?: number;
    imageUrl?: string;
    media?: { url: string }[];
    discount?: number;
    inventory: number;
    isExpress?: boolean;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const name = product.name || product.title || 'Product';
  const imageUrl = product.imageUrl || product.media?.[0]?.url || '/placeholder.png';
  const originalPrice = product.originalPrice || (product.discount ? product.price / (1 - product.discount / 100) : 0);

  const discount = originalPrice > product.price
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="bg-white rounded-sm p-3 flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-jumia-orange/10 h-full relative"
    >
      <div className="relative aspect-square w-full mb-3 bg-white overflow-hidden rounded-sm">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
          className="object-contain group-hover:scale-110 transition-transform duration-700 p-2"
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-jumia-orange text-white text-[10px] font-black px-2 py-1 rounded-sm shadow-sm">
            -{discount}%
          </span>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="text-xs font-bold text-j-text line-clamp-2 mb-2 group-hover:text-jumia-orange transition-colors min-h-[32px] leading-snug uppercase tracking-tight">
          {name}
        </h3>
        
        <div className="mt-auto space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-lg font-black text-j-text">
              ₦ {product.price.toLocaleString()}
            </p>
          </div>
          {originalPrice > product.price && (
            <p className="text-[10px] text-j-text-muted line-through font-bold">
              ₦ {originalPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Jumia Express Badge (rendered only if the product qualifies in the DB) */}
        <div className="mt-3 flex items-center gap-2 h-4">
          {product.isExpress && (
            <div className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase italic tracking-tighter">
              Jumia <span className="font-normal">Express</span>
            </div>
          )}
        </div>

        {/* Stock / Flash Progress */}
        <div className="mt-3 min-h-[14px]">
          {product.inventory < 10 && product.inventory > 0 ? (
            <div className="space-y-1">
              <div className="w-full h-1 bg-j-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-jumia-orange" 
                  style={{ width: `${(product.inventory / 10) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-jumia-orange font-black uppercase italic">
                {product.inventory} items left
              </p>
            </div>
          ) : product.inventory === 0 ? (
            <p className="text-[9px] text-j-error font-black uppercase tracking-widest">
              Sold Out
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

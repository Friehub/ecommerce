'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Heart, Trash2, ArrowRight, Loader2, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';

export default function WishlistPage() {
  const { data: wishlist, isLoading } = api.catalog.getWishlist.useQuery();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const utils = api.useUtils();

  const removeFromWishlist = api.catalog.removeFromWishlist.useMutation({
    onSuccess: () => {
      toast({ title: 'Item Removed', message: 'Item has been removed from your wishlist.', type: 'success' });
      utils.catalog.getWishlist.invalidate();
    }
  });

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart(item.variant.id, 1);
      toast({ title: 'Added to Cart', message: 'Item successfully added to your cart.', type: 'success' });
    } catch (error) {
      toast({ title: 'Error', message: 'Could not add item to cart.', type: 'error' });
    }
  };

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-j-text-muted uppercase tracking-widest">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-jumia-orange transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
          <span className="opacity-20">/</span>
          <span className="text-j-text">My Wishlist</span>
        </div>

        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-j-border bg-j-background flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-j-text uppercase tracking-tight">My <span className="text-jumia-orange">Wishlist</span></h1>
              <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest mt-1 opacity-60">{wishlist?.items.length || 0} Saved Items</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-sm border border-orange-100 flex items-center justify-center text-jumia-orange">
              <Heart size={24} fill="currentColor" />
            </div>
          </div>

          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-96 bg-j-background border border-j-border rounded-sm animate-pulse" />
                ))}
              </div>
            ) : wishlist?.items && wishlist.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.items.map((item: any, idx: number) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-j-border rounded-sm overflow-hidden hover:border-jumia-orange/30 hover:shadow-lg transition-all group flex flex-col"
                  >
                    <div className="relative aspect-square bg-j-background overflow-hidden p-4">
                      <Image 
                        src={item.variant.product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'} 
                        alt={item.variant.product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                      <button 
                        onClick={() => removeFromWishlist.mutate({ variantId: item.variant.id })}
                        disabled={removeFromWishlist.isLoading}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 shadow-sm rounded-full flex items-center justify-center text-j-text-muted hover:text-j-error transition-all border border-j-border"
                      >
                        <Trash2 size={16} />
                      </button>
                      {item.variant.product.isExpress && (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-jumia-orange text-white text-[8px] font-black px-2 py-1 rounded-sm uppercase tracking-widest shadow-sm">Express</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-[11px] text-j-text leading-tight line-clamp-2 uppercase tracking-tight mb-2 group-hover:text-jumia-orange transition-colors">
                          <Link href={`/products/${item.variant.product.slug}`}>{item.variant.product.title}</Link>
                        </h3>
                        <p className="text-lg font-black text-j-text tracking-tight">₦ {Number(item.variant.price).toLocaleString()}</p>
                      </div>

                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="w-full h-11 bg-jumia-orange hover:bg-orange-600 text-white rounded-sm font-black uppercase text-[10px] tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 group/btn"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-j-background border-2 border-dashed border-j-border rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart size={40} className="text-j-border" />
                </div>
                <h3 className="text-2xl font-black text-j-text uppercase tracking-tight">Your wishlist is empty</h3>
                <p className="text-[10px] font-black text-j-text-muted uppercase mt-2 mb-10 tracking-widest opacity-60">Save items you like here and buy them later.</p>
                <Link href="/" className="inline-flex items-center gap-3 px-10 py-4 bg-jumia-orange text-white rounded-sm font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all active:scale-95 group">
                  Start Shopping
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

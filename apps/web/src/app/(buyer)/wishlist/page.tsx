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
      toast({ title: 'Inventory Purged', message: 'Asset removed from your priority watchlist.', type: 'success' });
      utils.catalog.getWishlist.invalidate();
    }
  });

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart(item.variant.id, 1);
      toast({ title: 'Acquisition Initialized', message: 'Asset migrated to your logistics hub.', type: 'success' });
    } catch (error) {
      toast({ title: 'Migration Error', message: 'Could not add item to hub.', type: 'error' });
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb with Fade Mask */}
        <div className="relative mb-10 overflow-hidden">
          <div className="flex items-center gap-3 whitespace-nowrap overflow-x-auto scrollbar-hide pr-12">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-all font-black text-[10px] uppercase tracking-[0.2em] group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Home
            </Link>
            <span className="text-on-surface-variant/20">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 italic">Asset Priority List</span>
          </div>
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-on-surface tracking-tighter uppercase leading-none">Wishlist Matrix</h1>
              <p className="text-[10px] font-black text-on-surface-variant uppercase mt-4 tracking-[0.4em] opacity-40 italic">Monitoring {wishlist?.items.length || 0} prioritized inventory units</p>
            </div>
            <div className="w-20 h-20 bg-surface-container-low rounded-[32px] border-4 border-surface-container-lowest shadow-soft flex items-center justify-center text-primary-container group hover:scale-110 transition-transform duration-500">
              <Heart size={36} fill="currentColor" className="group-hover:animate-pulse" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[450px] bg-surface-container-low border-2 border-outline-variant/30 rounded-[40px] animate-pulse" />
              ))}
            </div>
          ) : wishlist?.items && wishlist.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.items.map((item: any, idx: number) => (
                <div 
                  key={item.id} 
                  className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[40px] overflow-hidden hover:border-primary-container/20 hover:shadow-2xl transition-all duration-700 group flex flex-col animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="relative aspect-square bg-surface-container-low/30 overflow-hidden m-4 rounded-[32px] border-2 border-outline-variant/10">
                    <Image 
                      src={item.variant.product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'} 
                      alt={item.variant.product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-8 group-hover:scale-110 transition-transform duration-[1.5s]"
                    />
                    <button 
                      onClick={() => removeFromWishlist.mutate({ variantId: item.variant.id })}
                      disabled={removeFromWishlist.isLoading}
                      className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md shadow-xl rounded-2xl flex items-center justify-center text-on-surface-variant hover:text-error transition-all active:scale-90 border border-white/20 group/trash"
                    >
                      <Trash2 size={20} className="group-hover/trash:rotate-12 transition-transform" />
                    </button>
                    {item.variant.product.isExpress && (
                       <div className="absolute bottom-6 left-6">
                         <span className="bg-primary-container text-white text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-xl border border-white/10">Express Delivery</span>
                       </div>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm text-on-surface leading-tight line-clamp-2 uppercase tracking-tighter mb-4 group-hover:text-primary-container transition-colors duration-500">
                        <Link href={`/products/${item.variant.product.slug}`}>{item.variant.product.title}</Link>
                      </h3>
                      <p className="text-2xl font-black text-on-surface tracking-tighter leading-none">₦ {Number(item.variant.price).toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="mt-8 w-full h-16 bg-on-surface hover:bg-primary-container text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 group/buy"
                    >
                      <ShoppingCart size={18} className="group-hover/buy:-translate-y-1 transition-transform" />
                      Add to Hub
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center px-8 bg-surface-container-low/30 border-4 border-dashed border-outline-variant/30 rounded-[64px] animate-in fade-in zoom-in-95 duration-1000">
              <div className="w-32 h-32 bg-surface-container-low border-4 border-surface-container-lowest rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-inner group">
                <Heart size={48} className="text-on-surface-variant opacity-10 group-hover:scale-125 transition-transform duration-1000" />
              </div>
              <h3 className="font-black text-4xl text-on-surface tracking-tighter uppercase leading-none">Zero Priority Assets</h3>
              <p className="text-[10px] font-black text-on-surface-variant uppercase mt-4 mb-12 tracking-[0.4em] opacity-40 italic">Initialize your wishlist matrix to monitor high-value targets</p>
              <Link href="/" className="inline-flex items-center gap-4 px-16 py-6 bg-primary-container text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary-container/30 hover:bg-on-surface transition-all hover:scale-105 active:scale-95 group">
                Begin Discovery
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

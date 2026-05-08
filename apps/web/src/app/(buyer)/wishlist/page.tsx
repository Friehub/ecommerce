'use client';

import React from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { ShoppingBag, ChevronRight, Heart, Trash2, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

export default function WishlistPage() {
  const { data: wishlist, isLoading, refetch } = api.catalog.getWishlist.useQuery();
  const { addToCart } = useCart();
  const utils = api.useUtils();

  const removeFromWishlist = api.catalog.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.catalog.getWishlist.invalidate();
    }
  });

  const handleAddToCart = async (item: any) => {
    try {
      await addToCart(item.variant.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-gray-400 hover:text-[#F68B1E] transition-colors text-[10px] font-black uppercase tracking-widest">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Saved Items</span>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">Saved Items</h1>
              <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-tight">Your favorite products in one place</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#F68B1E]">
              <Heart size={28} fill="currentColor" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white border border-gray-100 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : wishlist?.items && wishlist.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.items.map((item: any) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-100 rounded-[32px] overflow-hidden hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/[0.05] transition-all duration-500 group flex flex-col"
                >
                  <div className="relative aspect-square bg-gray-50/30 overflow-hidden">
                    <img 
                      src={item.variant.product.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
                      alt={item.variant.product.title}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                    />
                    <button 
                      onClick={() => removeFromWishlist.mutate({ variantId: item.variant.id })}
                      disabled={removeFromWishlist.isLoading}
                      className="absolute top-4 right-4 w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                    {item.variant.product.isExpress && (
                       <div className="absolute bottom-4 left-4">
                         <span className="bg-[#F68B1E] text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg">Jumia Express</span>
                       </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm text-gray-900 leading-tight line-clamp-2 uppercase tracking-tight mb-2 group-hover:text-[#F68B1E] transition-colors">
                        <Link href={`/products/${item.variant.product.slug}`}>{item.variant.product.title}</Link>
                      </h3>
                      <p className="text-xl font-black text-gray-900">₦ {Number(item.variant.price).toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="mt-6 w-full h-12 bg-[#F68B1E] hover:bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <ShoppingCart size={16} />
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center px-4 bg-white border border-gray-100 rounded-[48px] shadow-sm">
              <div className="w-28 h-28 bg-gray-50 border border-gray-100 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                <Heart size={48} className="text-gray-200" />
              </div>
              <h3 className="font-black text-3xl text-gray-900 tracking-tight uppercase">Your wishlist is empty</h3>
              <p className="text-sm font-bold text-gray-400 uppercase mt-2 mb-10 tracking-[0.2em]">Add items you love to your wishlist and shop them later</p>
              <Link href="/" className="inline-flex items-center gap-4 px-12 py-5 bg-[#F68B1E] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-orange-500/30 hover:bg-black transition-all hover:scale-105 active:scale-95">
                Discover Products
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

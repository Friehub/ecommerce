'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, X, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '../ui/Button';
import { api } from '@/trpc/react';

const SuggestedProducts = () => {
  const { addToCart } = useCart();
  const { data: productsData, isLoading } = api.catalog.listProducts.useQuery({ limit: 3 });

  if (isLoading || !productsData?.results?.length) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 w-full bg-j-background border border-j-border rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {productsData.results.map((product: any) => {
        const variant = product.variants?.[0];
        if (!variant) return null;
        return (
          <div key={product.id} className="flex gap-3 p-2 bg-j-background border border-j-border rounded-sm items-center justify-between group">
            <div className="flex gap-3 items-center min-w-0">
              <div className="w-10 h-10 bg-white rounded-sm overflow-hidden flex-shrink-0 relative border border-j-border">
                <Image 
                  src={product.media[0]?.url || '/placeholder.png'} 
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="min-w-0">
                <h5 className="text-[10px] font-bold text-j-text truncate max-w-[150px] uppercase leading-none">{product.title}</h5>
                <p className="text-[10px] font-black text-jumia-orange mt-1">₦ {Number(variant.price).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => addToCart(variant.id, 1)}
              className="px-2.5 py-1.5 bg-jumia-orange text-white text-[9px] font-black uppercase tracking-wider rounded-sm hover:bg-orange-600 transition-all active:scale-95 shadow-sm shrink-0"
            >
              + Add
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, totalItems } = useCart();

  const cartTotal = cart?.items?.reduce((acc: number, item: any) =>
    acc + (Number(item.priceSnapshot ?? item.variant?.price ?? 0)) * item.quantity, 0
  ) ?? 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-[110] shadow-xl flex flex-col transition-transform duration-300 border-l border-j-border animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-j-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-j-text" />
            <div>
              <h2 className="font-black text-j-text uppercase text-xs tracking-wider">Cart ({totalItems})</h2>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-j-background rounded-sm border border-transparent hover:border-j-border transition-all"
          >
            <X size={20} className="text-j-text" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {cart?.items?.length > 0 ? (
            <div className="space-y-4">
              {cart.items.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-2 bg-white rounded-sm border border-j-border hover:border-jumia-orange transition-all"
                >
                  <div className="w-16 h-16 bg-white rounded-sm overflow-hidden flex-shrink-0 relative border border-j-border">
                    <Image 
                      src={item.variant.product.media[0]?.url || '/placeholder.png'} 
                      alt={item.variant.product.title}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[10px] font-bold text-j-text line-clamp-2 uppercase leading-snug">
                        {item.variant.product.title}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-j-text-muted hover:text-error transition-colors p-0.5 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <p className="text-[9px] text-j-text-muted mt-1 truncate uppercase font-bold">
                      {Object.values(item.variant.attributes as any).join(' / ')}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center border border-j-border rounded-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-j-background text-xs font-bold"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-[10px] font-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-j-background text-xs font-bold"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="text-xs font-black text-j-text">
                        ₦ {((Number(item.priceSnapshot ?? item.variant?.price ?? 0)) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="w-16 h-16 bg-j-background rounded-sm flex items-center justify-center mb-4 border border-j-border">
                <ShoppingBag size={24} className="text-j-text-muted opacity-40 animate-bounce" />
              </div>
              <h3 className="font-black text-j-text text-sm uppercase mb-1">Your cart is empty!</h3>
              <p className="text-j-text-muted text-[10px] uppercase font-bold mb-6 max-w-[200px] leading-relaxed">
                Browse our categories and discover our best deals!
              </p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="w-full text-xs font-black uppercase h-10 tracking-wider"
              >
                Start Shopping
              </Button>
            </div>
          )}

          {/* Upsell / Suggested Products Section */}
          <div className="pt-6 border-t border-j-border mt-4">
            <h4 className="text-[10px] font-black uppercase text-j-text-muted mb-4 tracking-wider">You might also like</h4>
            <SuggestedProducts />
          </div>
        </div>

        {cart?.items?.length > 0 && (
          <div className="p-6 border-t border-j-border bg-j-background space-y-4 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] text-center">
            <div className="flex items-center justify-between">
              <span className="text-j-text-muted font-black text-[10px] uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-black text-j-text">₦ {cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-[9px] font-bold text-j-text-muted uppercase">Customs fee and shipping excluded</p>
            
            <Link href="/cart" className="block" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-12 text-xs font-black uppercase tracking-widest">
                CHECKOUT (₦ {cartTotal.toLocaleString()})
              </Button>
            </Link>

            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-black uppercase tracking-wider text-jumia-orange hover:underline pt-1 inline-block mx-auto"
            >
              ← Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

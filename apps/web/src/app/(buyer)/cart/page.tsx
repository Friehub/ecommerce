// apps/web/src/app/(buyer)/cart/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingCart, ChevronRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems } = useCart();

  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;

  return (
    <div className="bg-j-background min-h-screen pb-16">
      <div className="max-w-[1184px] mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-j-text-muted uppercase tracking-wider">
          <Link href="/" className="hover:text-jumia-orange transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-j-text">Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items Section */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-5 border-b border-j-border bg-j-background">
                <h1 className="text-xl font-black text-j-text uppercase tracking-tight">Cart ({totalItems})</h1>
              </div>

              {cart?.items?.length > 0 ? (
                <div className="divide-y divide-j-border">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-6 p-6 group">
                      {/* Image */}
                      <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-sm border border-j-border flex-shrink-0 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-j-text-muted transition-colors">
                        <img 
                          src={item.variant?.product?.media?.[0]?.url || '/placeholder.png'} 
                          alt={item.variant?.product?.title}
                          className="w-full h-full object-contain transition-transform group-hover:scale-110"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-6">
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-j-text line-clamp-2 uppercase tracking-tight leading-tight mb-2 group-hover:text-jumia-orange transition-colors">
                              {item.variant?.product?.title}
                            </h3>
                            {item.variant?.attributes && (
                              <p className="text-[10px] text-j-text-muted uppercase font-black tracking-widest opacity-70">
                                {Object.values(item.variant.attributes as any).join(' • ')}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                               <span className="bg-orange-100 text-jumia-orange text-[9px] font-black uppercase px-2 py-0.5 rounded-sm italic tracking-tighter border border-orange-200">Jumia Express</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end shrink-0">
                            <span className="text-lg font-black text-j-text">
                              ₦ {(Number(item.priceSnapshot ?? 0) * item.quantity).toLocaleString()}
                            </span>
                            {item.variant?.comparePrice && Number(item.variant.comparePrice) > Number(item.priceSnapshot) && (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-j-text-muted line-through font-bold">
                                  ₦ {(Number(item.variant.comparePrice) * item.quantity).toLocaleString()}
                                </span>
                                <span className="text-[10px] bg-red-50 text-red-600 px-1 font-black rounded-sm border border-red-100">
                                  -{Math.round((1 - Number(item.priceSnapshot) / Number(item.variant.comparePrice)) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-2 text-jumia-orange hover:text-orange-700 font-black text-[11px] uppercase tracking-widest transition-all active:scale-90"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>

                          <div className="flex items-center border-2 border-j-border rounded-sm h-10 overflow-hidden bg-j-background shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-10 h-full flex items-center justify-center hover:bg-white transition-colors text-j-text border-r-2 border-j-border disabled:opacity-30"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-full flex items-center justify-center hover:bg-white transition-colors text-j-text border-l-2 border-j-border"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center px-8">
                  <div className="w-20 h-20 bg-j-background text-j-border rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-j-border">
                    <ShoppingCart size={40} />
                  </div>
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-tight text-j-text">Your cart is empty!</h3>
                  <p className="text-[11px] text-j-text-muted mb-10 uppercase font-black tracking-widest opacity-60">Browse our categories and discover our best deals!</p>
                  <Link href="/" className="bg-jumia-orange text-white px-10 py-4 rounded-sm font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg inline-block">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Summary Panel */}
          {cart?.items?.length > 0 && (
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white rounded-sm border border-j-border shadow-sm p-6 sticky top-24 flex flex-col gap-6 overflow-hidden">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-j-text-muted border-b border-j-border pb-4">Cart Summary</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-j-text-muted font-black uppercase tracking-tight">Subtotal</span>
                    <span className="text-j-text font-black text-lg">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-j-text-muted">
                    <span className="font-black uppercase tracking-tight">Shipping Fee</span>
                    <span className="font-black uppercase text-jumia-orange bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-sm">Calculated at checkout</span>
                  </div>
                  <div className="pt-6 border-t-2 border-j-border border-dashed flex justify-between items-center">
                    <span className="text-sm font-black text-j-text uppercase tracking-widest">Subtotal Amount</span>
                    <span className="text-2xl font-black text-jumia-orange">₦ {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-jumia-orange text-white py-4 rounded-sm font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 mt-4 active:scale-[0.98]"
                >
                  <ShoppingCart size={20} />
                  Checkout
                </Link>

                <div className="bg-j-background p-4 rounded-sm border border-j-border border-dashed">
                    <p className="text-[9px] font-black uppercase tracking-tighter text-j-text-muted text-center leading-relaxed italic opacity-80">
                        Delivery charges and taxes are calculated at checkout.
                        By proceeding you agree to our Terms of Use and Privacy Policy.
                    </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

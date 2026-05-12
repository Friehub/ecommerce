'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '../../../context/CartContext';
import { X, ShoppingBag, Trash2, Plus, Minus, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalItems } = useCart();

  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (Number(item.priceSnapshot ?? 0) * item.quantity), 0) || 0;
  const shipping = cart?.items?.length > 0 ? 1200 : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-background min-h-screen pb-12 select-none">
      <div className="container py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 mb-8 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">
          <Link href="/" className="hover:text-primary-container transition-colors">Home</Link>
          <ChevronRight size={14} className="opacity-30" />
          <span className="text-on-surface">Shopping Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items Section */}
          <div className="flex-1">
            <div className="bg-surface-container-lowest rounded-[32px] border border-outline-variant hover:border-outline duration-300 transition-all shadow-soft overflow-hidden p-6 lg:p-10">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary-container/10 p-2.5 rounded-xl">
                    <ShoppingBag size={24} className="text-primary-container" />
                  </div>
                  <h1 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">Cart ({totalItems})</h1>
                </div>
              </div>

              {cart?.items?.length > 0 ? (
                <div className="divide-y divide-outline-variant/20">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 py-6 last:pb-0 group animate-in fade-in duration-500">
                      <div className="w-28 h-28 bg-surface-container-low rounded-2xl border border-outline-variant/50 overflow-hidden flex-shrink-0 flex items-center justify-center p-3 relative group-hover:border-primary-container/30 transition-colors">
                        <img 
                          src={item.variant?.product?.media?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'} 
                          alt={item.variant?.product?.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-black text-on-surface leading-snug hover:text-primary-container transition-colors cursor-pointer line-clamp-2 uppercase tracking-tight">
                              {item.variant?.product?.title}
                            </h3>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-on-surface-variant hover:text-error hover:bg-error/5 p-2 rounded-xl transition-all flex items-center justify-center ml-4 flex-shrink-0 cursor-pointer touch-manipulation active:scale-90"
                              aria-label="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          {item.variant?.attributes && (
                            <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mt-2 bg-primary-container/5 px-3 py-1 rounded-lg w-fit border border-primary-container/10 italic">
                              {Object.values(item.variant.attributes as any).join(' • ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden h-11">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-11 hover:bg-surface-container h-full flex items-center justify-center transition-colors text-on-surface touch-manipulation active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 text-sm font-black text-on-surface">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-11 hover:bg-surface-container h-full flex items-center justify-center transition-colors text-on-surface touch-manipulation active:scale-90"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="text-lg font-black text-primary-container tracking-tighter">
                            ₦ {(Number(item.priceSnapshot ?? 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center px-4 select-none animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-24 h-24 bg-surface-container-low text-primary-container rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-outline-variant/30 shadow-lg shadow-primary-container/5">
                    <ShoppingBag size={44} />
                  </div>
                  <h3 className="font-black text-2xl text-on-surface leading-none uppercase tracking-tighter">Your cart is empty</h3>
                  <p className="text-on-surface-variant font-medium text-sm mt-3 max-w-xs mx-auto leading-relaxed italic opacity-60">
                    Browse our categories and discover our best deals!
                  </p>
                  <div className="flex flex-col items-center gap-4 mt-10">
                    <Link href="/" className="px-10 py-5 bg-primary-container text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-container/20 hover:opacity-90 active:scale-95 duration-200">
                      Start Shopping
                    </Link>
                    <Link href="/wishlist" className="text-xs font-black text-tertiary uppercase tracking-widest hover:underline">
                      View your saved items
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Side-Panel */}
          {cart?.items?.length > 0 && (
            <div className="w-full lg:w-[380px] select-none">
              <div className="bg-surface-container-lowest rounded-[32px] border border-outline-variant hover:border-outline transition-all duration-300 shadow-soft p-8 sticky top-24">
                <h3 className="font-black uppercase text-xs tracking-widest text-on-surface-variant border-b border-outline-variant/30 pb-4 mb-6 opacity-40 italic">Order Summary</h3>
                <div className="space-y-5">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-on-surface-variant opacity-60">Subtotal</span>
                    <span className="text-on-surface">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                    <span className="text-on-surface-variant opacity-60">Shipping (estimate)</span>
                    <span className="text-on-surface">₦ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-outline-variant/30 pt-6 flex justify-between items-center">
                    <span className="font-black text-on-surface uppercase tracking-tight">Total</span>
                    <span className="font-black text-primary-container text-3xl tracking-tighter">₦ {total.toLocaleString()}</span>
                  </div>

                  <Link 
                    href="/checkout"
                    className="w-full h-16 bg-primary-container text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-primary-container/30 active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-container/20 select-none mt-8 text-xs"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  
                  <p className="text-[9px] text-center font-black text-on-surface-variant uppercase tracking-[0.2em] mt-6 opacity-40">
                    Secured by Jumia SafePay
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

'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
 className="fixed inset-0 bg-jumia-orange/80 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-500"
 onClick={() => setIsOpen(false)}
 />

 {/* Drawer */}
 <div className="fixed right-0 top-0 h-full w-full max-w-md bg-surface-container-lowest z-[110] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-surface-container-low">
 <div className="p-8 border-b border-surface-container-low flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="bg-jumia-orange/10 p-3 rounded-sm border border-jumia-orange/20">
 <ShoppingBag size={24} className="text-jumia-orange" />
 </div>
 <div>
 <h2 className="font-semibold text-on-surface uppercase tracking-widest text-sm leading-none mb-1">Logistics Hub</h2>
 <p className="text-[9px] font-semibold text-on-surface-variant uppercase tracking-widest opacity-40 italic">{totalItems} Assets Identified</p>
 </div>
 </div>
 <button 
 onClick={() => setIsOpen(false)}
 className="p-3 hover:bg-surface-container-low rounded-2xl transition-all touch-manipulation group active:scale-90"
 >
 <X size={24} className="text-on-surface-variant group-hover:rotate-90 transition-transform duration-500" />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
 {cart?.items?.length > 0 ? (
 cart.items.map((item: any, idx: number) => (
 <div 
 key={item.id} 
 className="flex gap-6 group animate-in fade-in slide-in-from-right-8 duration-700"
 style={{ animationDelay: `${idx * 100}ms` }}
 >
 <div className="w-24 h-24 bg-surface-container-low rounded border-2 border-surface-container-lowest overflow-hidden flex-shrink-0 relative shadow-inner">
 <Image 
 src={item.variant.product.media[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400'} 
 alt={item.variant.product.title}
 fill
 sizes="96px"
 className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
 />
 </div>
 <div className="flex-1 flex flex-col py-1">
 <div className="flex justify-between items-start gap-4 mb-2">
 <h3 className="text-[11px] font-semibold text-on-surface uppercase tracking-tight line-clamp-2 leading-tight flex-1 group-hover:text-jumia-orange transition-colors">
 {item.variant.product.title}
 </h3>
 <button 
 onClick={() => removeFromCart(item.id)}
 className="text-on-surface-variant/40 hover:text-error transition-all p-2 bg-surface-container-low/50 rounded-xl active:scale-90"
 >
 <Trash2 size={16} />
 </button>
 </div>
 
 <p className="text-[8px] font-semibold text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-40 italic">
 {Object.values(item.variant.attributes as any).join(' / ')}
 </p>

 <div className="flex items-center justify-between mt-auto">
 <div className="flex items-center bg-surface-container-low rounded-2xl border-2 border-surface-container-lowest p-1">
 <button 
 onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
 className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all touch-manipulation active:scale-90"
 >
 <Minus size={14} />
 </button>
 <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
 <button 
 onClick={() => updateQuantity(item.id, item.quantity + 1)}
 className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all touch-manipulation active:scale-90"
 >
 <Plus size={14} />
 </button>
 </div>
 <div className="text-sm font-semibold text-on-surface tracking-tighter">
 ₦ {((Number(item.priceSnapshot ?? item.variant?.price ?? 0)) * item.quantity).toLocaleString()}
 </div>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-center px-4">
 <div className="w-32 h-32 bg-surface-container-low rounded flex items-center justify-center mb-10 border border-surface-container-lowest shadow-inner group">
 <ShoppingBag size={48} className="text-on-surface-variant opacity-20 group-hover:scale-110 transition-transform duration-700" />
 </div>
 <h3 className="font-semibold text-on-surface text-xl uppercase tracking-tighter leading-none mb-4">Registry Clear</h3>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-[0.3em] mt-2 max-w-[280px] opacity-40 italic leading-relaxed">
 Logistics hub is awaiting asset ingestion commands.
 </p>
 <button 
 onClick={() => setIsOpen(false)}
 className="mt-12 bg-jumia-orange text-white px-12 py-5 rounded font-semibold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-on-surface/20 hover:bg-jumia-orange-dark active:scale-95 transition-all flex items-center gap-4 group"
 >
 Discover Assets
 <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
 </button>
 </div>
 )}
 </div>

 {cart?.items?.length > 0 && (
 <div className="p-8 border-t-4 border-surface-container-low bg-surface-container-lowest space-y-8 shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Sparkles size={16} className="text-jumia-orange" />
 <span className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-[0.3em] italic opacity-60">Aggregate Value</span>
 </div>
 <span className="text-3xl font-semibold text-on-surface tracking-tighter leading-none">₦ {cartTotal.toLocaleString()}</span>
 </div>
 <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
 <div className="h-full bg-jumia-orange w-2/3 animate-pulse" />
 </div>
 </div>
 
 <Link 
 href="/cart"
 onClick={() => setIsOpen(false)}
 className="w-full bg-jumia-orange text-white py-6 rounded font-semibold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary-container/40 hover:bg-jumia-orange active:scale-[0.96] transition-all flex items-center justify-center gap-4 group"
 >
 Initialize Settlement
 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
 </Link>
 </div>
 )}
 </div>
 </>
 );
};


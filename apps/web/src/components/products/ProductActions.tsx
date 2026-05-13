'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../trpc/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface ProductActionsProps {
 product: any;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
 const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
 const [quantity, setQuantity] = useState(1);
 const { data: session } = useSession();
 const { showToast } = useToast();
 const router = useRouter();

 const price = selectedVariant?.price || 0;
 const comparePrice = selectedVariant?.comparePrice;
 const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

 const { addToCart, isLoading: isCartLoading } = useCart();
 
 const utils = api.useUtils();
 const { data: wishlist } = api.catalog.getWishlist.useQuery(undefined, {
 retry: false,
 enabled: !!session,
 });

 const addToWishlist = api.catalog.addToWishlist.useMutation({
 onSuccess: () => {
 utils.catalog.getWishlist.invalidate();
 showToast('Item added to wishlist');
 },
 onError: (err) => showToast(err.message, 'error')
 });

 const removeFromWishlist = api.catalog.removeFromWishlist.useMutation({
 onSuccess: () => {
 utils.catalog.getWishlist.invalidate();
 showToast('Item removed from wishlist', 'info');
 },
 onError: (err) => showToast(err.message, 'error')
 });

 const isInWishlist = wishlist?.items?.some((item: any) => item.variantId === selectedVariant.id);

 const handleWishlistToggle = async () => {
 if (!session) {
 router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
 return;
 }

 if (isInWishlist) {
 await removeFromWishlist.mutateAsync({ variantId: selectedVariant.id });
 } else {
 await addToWishlist.mutateAsync({ variantId: selectedVariant.id });
 }
 };

 const handleAddToCart = async () => {
 try {
 await addToCart(selectedVariant.id, quantity);
 showToast('Successfully added to cart!');
 } catch (err: any) {
 showToast(err.message || 'Failed to add to cart', 'error');
 }
 };

 return (
 <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 {/* Price Section */}
 <div className="border-b border-outline-variant pb-6">
 <div className="flex items-center gap-4">
 <span className="text-4xl font-black text-on-surface tracking-tighter">₦ {price.toLocaleString()}</span>
 {discount > 0 && (
 <span className="bg-error-container text-error text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
 -{discount}% OFF
 </span>
 )}
 </div>
 {comparePrice && (
 <div className="text-on-surface-variant line-through text-sm mt-1 opacity-60">₦ {comparePrice.toLocaleString()}</div>
 )}
 
 <div className="flex items-center gap-4 mt-6 bg-surface-container-low/50 p-4 rounded-2xl border-2 border-surface-container-low">
 <div className={`w-3 h-3 rounded-full ${selectedVariant.inventory > 10 ? 'bg-success' : selectedVariant.inventory > 0 ? 'bg-primary-container' : 'bg-error'} animate-pulse shadow-lg`} />
 <p className={`text-xs font-black uppercase tracking-[0.2em] ${selectedVariant.inventory > 10 ? 'text-success' : selectedVariant.inventory > 0 ? 'text-primary-container' : 'text-error'}`}>
 {selectedVariant.inventory > 10 ? 'Nominal Supply' : selectedVariant.inventory > 0 ? `Critical Inventory (${selectedVariant.inventory} Units)` : 'Depleted - Order Void'}
 </p>
 </div>
 <p className="text-[10px] text-on-surface-variant mt-2 font-black uppercase tracking-[0.2em] opacity-40 italic">+ Delivery estimation: ₦ 600 (Lagos Metropolis)</p>
 </div>

 {/* Variants Section */}
 {product.variants.length > 1 && (
 <div className="space-y-4">
 <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.4em] opacity-40">Configuration Matrix</h4>
 <div className="flex flex-wrap gap-3">
 {product.variants.map((v: any) => {
 const label = Object.values(v.attributes as any).join(' • ');
 const isSelected = selectedVariant.id === v.id;
 return (
 <button
 key={v.id}
 onClick={() => setSelectedVariant(v)}
 className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] border-2 rounded-2xl transition-all duration-500 touch-manipulation ${
 isSelected
 ? 'border-primary-container text-primary-container bg-primary-container/5 shadow-lg shadow-primary-container/5 -translate-y-1'
 : 'border-surface-container-low text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low/50'
 }`}
 >
 {label}
 </button>
 );
 })}
 </div>
 </div>
 )}

 {/* Quantity & Add to Cart */}
 <div className="flex flex-col gap-6 pt-2">
 <div className="flex flex-col sm:flex-row items-stretch gap-4">
 <div className="flex items-center bg-surface-container-low rounded-2xl border-4 border-surface-container-lowest h-16 overflow-hidden shadow-soft">
 <button 
 onClick={() => setQuantity(q => Math.max(1, q - 1))}
 className="w-16 h-full flex items-center justify-center hover:bg-surface-container transition-colors touch-manipulation text-on-surface"
 disabled={isCartLoading}
 >
 <Minus size={20} strokeWidth={2.5} />
 </button>
 <span className="w-14 text-center font-black text-xl text-on-surface">{quantity}</span>
 <button 
 onClick={() => setQuantity(q => q + 1)}
 className="w-16 h-full flex items-center justify-center hover:bg-surface-container transition-colors touch-manipulation text-on-surface"
 disabled={isCartLoading}
 >
 <Plus size={20} strokeWidth={2.5} />
 </button>
 </div>
 
 <button 
 onClick={handleAddToCart}
 disabled={isCartLoading || selectedVariant.inventory === 0}
 className="flex-1 bg-on-surface text-white h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:opacity-90 active:scale-[0.98] disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4 group"
 >
 <ShoppingCart size={22} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
 {isCartLoading ? 'Processing...' : selectedVariant.inventory === 0 ? 'Out of Stock' : 'Add to Acquisition'}
 </button>
 </div>
 
 <button 
 onClick={handleWishlistToggle}
 className={`flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] transition-all py-4 rounded-2xl hover:bg-surface-container-low border-2 border-transparent hover:border-surface-container-lowest ${
 isInWishlist ? 'text-error' : 'text-on-surface-variant hover:text-primary-container'
 }`}
 >
 <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} strokeWidth={1.5} className="transition-transform duration-500 active:scale-150" />
 {isInWishlist ? 'Purge from Wishlist' : 'Archive to Wishlist'}
 </button>
 </div>

 {/* Service Info Cards */}
 <div className="grid grid-cols-1 gap-4">
 {[
 { icon: Truck, title: 'Express Logistics', desc: 'Secure transit enabled. Delivery verified within 24–48 operational hours.' },
 { icon: RotateCcw, title: 'Protection Period', desc: '15-day sovereign return window for all certified official store items.' },
 { icon: ShieldCheck, title: 'Warranty Lock', desc: 'Comprehensive 12-month official manufacturer coverage included.' }
 ].map((service, i) => (
 <div key={i} className="flex gap-5 p-6 bg-surface-container-lowest border-4 border-surface-container-low rounded-[32px] shadow-soft hover:shadow-2xl transition-all duration-500 group">
 <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-container/10 border-2 border-surface-container-lowest transition-all">
 <service.icon size={26} strokeWidth={1.5} className="text-on-surface-variant group-hover:text-primary-container transition-colors" />
 </div>
 <div className="flex flex-col justify-center">
 <h5 className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em] mb-1.5">{service.title}</h5>
 <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium italic opacity-70">{service.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
};


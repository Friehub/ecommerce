'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { api } from '@/trpc/react';
import { 
 Plus, 
 Search, 
 Package, 
 Eye,
 Edit2,
 Trash2,
 Star,
 Filter,
 SearchCode,
 ArrowRight,
 Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { ProductStatusBadge } from '@/components/ui/ProductStatusBadge';
import { useToast } from '@/hooks/useToast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SellerInventory() {
 const { data: products, isLoading } = api.seller.listMyProducts.useQuery();
 const utils = api.useUtils();
 const { toast } = useToast();
 
 const [productToDelete, setProductToDelete] = useState<string | null>(null);

 const deleteProduct = api.catalog.deleteProduct.useMutation({
 onSuccess: () => {
 utils.seller.listMyProducts.invalidate();
 toast({
 title: 'ASSET DECOMMISSIONED',
 message: 'Product has been permanently removed from the catalog.',
 type: 'success',
 });
 setProductToDelete(null);
 },
 onError: (err) => {
 toast({
 title: 'DELETION ERROR',
 message: err.message || 'System failed to purge the resource.',
 type: 'error',
 });
 setProductToDelete(null);
 }
 });

 if (isLoading) {
 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="space-y-6">
 <Skeleton className="h-16 w-96 rounded" />
 <Skeleton className="h-6 w-64 rounded-xl" />
 </div>
 <Skeleton className="h-20 w-64 rounded" />
 </div>
 <div className="flex gap-8">
 <Skeleton className="h-20 flex-1 rounded" />
 <Skeleton className="h-20 w-64 rounded" />
 </div>
 <Skeleton className="h-[700px] w-full rounded-[64px]" />
 </div>
 );
 }

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <Package size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Enterprise Asset Management</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Resource <br />
 <span className="text-jumia-orange italic">Inventory.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Global Stock Matrix & Catalog Authorization Protocol</p>
 </div>
 <Link 
 href="/seller/inventory/new"
 className="bg-jumia-orange text-white px-12 py-6 rounded text-xs font-semibold uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl active:scale-95 flex items-center gap-4 group animate-in slide-in-from-right-8 duration-1000"
 >
 <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
 Register New Asset
 </Link>
 </div>

 {/* Control Bar */}
 <div className="flex flex-col lg:flex-row gap-8">
 <div className="relative group flex-1">
 <SearchCode className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within:opacity-100 transition-all duration-500" size={24} />
 <input 
 type="text" 
 placeholder="SEARCH INVENTORY BY IDENTITY OR ATTRIBUTE..."
 className="w-full pl-20 pr-10 py-6 bg-surface-container-low border border-surface-container-lowest rounded focus:outline-none focus:border-jumia-orange/50 focus:ring-8 focus:ring-primary-container/5 text-xs font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50  transition-all shadow-soft"
 />
 </div>
 <div className="flex gap-4">
 <div className="relative">
 <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20" size={18} />
 <select className="bg-surface-container-low border border-surface-container-lowest rounded pl-16 pr-12 py-6 text-[10px] font-semibold text-on-surface uppercase  focus:outline-none focus:border-jumia-orange/50 transition-all appearance-none cursor-pointer min-w-[280px] shadow-soft">
 <option>ALL CLASSIFICATIONS</option>
 <option>ACTIVE RELEASES</option>
 <option>DRAFTED ASSETS</option>
 </select>
 </div>
 </div>
 </div>

 {/* Inventory Matrix */}
 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[1200px]">
 <thead>
 <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-semibold uppercase  bg-surface-container-low/20 italic">
 <th className="px-12 py-8">Asset Identity</th>
 <th className="px-12 py-8 text-center">Market Intelligence</th>
 <th className="px-12 py-8">Valuation (₦)</th>
 <th className="px-12 py-8 text-center">Liquidity</th>
 <th className="px-12 py-8">Status</th>
 <th className="px-12 py-8 text-right">Operations</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {products?.map((product, idx) => {
 const prices = product.variants.map(v => Number(v.price));
 const minPrice = Math.min(...prices);
 const maxPrice = Math.max(...prices);
 
 const totalStock = product.variants.reduce((acc, v) => 
 acc + v.stockLevels.reduce((sAcc, s) => sAcc + s.qtyOnHand, 0), 0
 );

 return (
 <tr key={product.id} className="hover:bg-surface-container-low/30 duration-700 transition-all group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
 <td className="px-12 py-10">
 <div className="flex items-center gap-8">
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center border-2 border-outline-variant/10 shrink-0 overflow-hidden shadow-inner group-hover:scale-105 group-hover:border-jumia-orange/30 transition-all duration-1000 relative">
 {product.media[0] ? (
 <Image 
 src={product.media[0].url} 
 alt={product.title}
 fill
 sizes="96px"
 className="object-contain p-4"
 />
 ) : (
 <Package size={40} className="text-on-surface-variant/20" />
 )}
 </div>
 <div className="max-w-[380px]">
 <div className="text-lg font-semibold text-on-surface leading-none tracking-tighter uppercase group-hover:text-jumia-orange transition-colors duration-500 cursor-pointer mb-4">{product.title}</div>
 <div className="flex items-center gap-3">
 {product.isExpress && <span className="text-[8px] font-semibold text-jumia-orange uppercase  bg-jumia-orange/10 border border-jumia-orange/20 px-3 py-1 rounded-xl italic">EXPRESS NODE</span>}
 <div className="text-on-surface-variant/20 text-[8px] font-semibold uppercase  italic">IDX: {product.id.slice(-12).toUpperCase()}</div>
 </div>
 </div>
 </div>
 </td>
 <td className="px-12 py-10 text-center">
 <div className="inline-flex flex-col items-center bg-surface-container-low/50 px-6 py-4 rounded border-2 border-surface-container-lowest group-hover:border-jumia-orange/10 transition-all duration-700 shadow-inner">
 <div className="flex items-center gap-3 mb-2">
 <Star size={16} className="fill-primary-container text-jumia-orange" />
 <span className="text-xl font-semibold text-on-surface tracking-tighter">{Number(product.averageRating || 0).toFixed(1)}</span>
 </div>
 <div className="text-on-surface-variant/30 text-[9px] font-semibold uppercase  italic">
 {product.reviewCount || 0} CONSUMER AUDITS
 </div>
 </div>
 </td>
 <td className="px-12 py-10">
 <div className="text-2xl font-semibold text-on-surface tracking-tighter leading-none mb-3">
 ₦{minPrice.toLocaleString()} {maxPrice > minPrice && ` - ₦${maxPrice.toLocaleString()}`}
 </div>
 <div className="text-[9px] font-semibold text-on-surface-variant/20 uppercase  italic">CURRENT MARKET PRICE</div>
 </td>
 <td className="px-12 py-10 text-center">
 <div className="space-y-3">
 <div className={`text-xl font-semibold tracking-tighter leading-none ${totalStock > 0 ? 'text-on-surface' : 'text-error'}`}>
 {totalStock.toLocaleString()} <span className="text-[10px] uppercase opacity-20 ml-2">UNITS</span>
 </div>
 <div className="text-on-surface-variant/20 text-[8px] font-semibold uppercase  bg-surface-container-low px-4 py-1.5 rounded-2xl border border-outline-variant/10 inline-block italic">
 {product.variants.length} VARIANT NODES
 </div>
 </div>
 </td>
 <td className="px-12 py-10">
 <span className={`inline-flex items-center px-6 py-2.5 rounded-full text-[9px] font-semibold uppercase  border-2 shadow-sm italic transition-all duration-700 ${
 product.status === 'ACTIVE' 
 ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20' 
 : 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
 }`}>
 <div className={`w-2 h-2 rounded-full mr-3 ${product.status === 'ACTIVE' ? 'bg-jumia-orange animate-pulse' : 'bg-jumia-orange-variant/20'}`} />
 {product.status}
 </span>
 </td>
 <td className="px-12 py-10 text-right">
 <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-8 group-hover:translate-x-0 duration-700">
 <button className="w-14 h-14 bg-surface-container-low text-on-surface-variant border-2 border-surface-container-lowest hover:bg-jumia-orange hover:text-white rounded-sm transition-all duration-500 flex items-center justify-center active:scale-90 shadow-soft">
 <Eye size={20} />
 </button>
 <button className="w-14 h-14 bg-surface-container-low text-on-surface-variant border-2 border-surface-container-lowest hover:bg-jumia-orange hover:text-white rounded-sm transition-all duration-500 flex items-center justify-center active:scale-90 shadow-soft">
 <Edit2 size={20} />
 </button>
 <button 
 onClick={() => setProductToDelete(product.id)}
 className="w-14 h-14 bg-error-container/10 text-error border-2 border-error/20 hover:bg-error hover:text-white rounded-sm transition-all duration-500 flex items-center justify-center active:scale-90 shadow-soft"
 disabled={deleteProduct.isPending}
 >
 <Trash2 size={20} />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 {(!products || products.length === 0) && (
 <tr>
 <td colSpan={6} className="px-12 py-40 text-center">
 <div className="flex flex-col items-center gap-10 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-1000">
 <div className="w-32 h-32 bg-surface-container-low rounded flex items-center justify-center border border-surface-container-lowest text-on-surface-variant shadow-inner group">
 <Package size={64} strokeWidth={1} className="opacity-10 group-hover:scale-110 transition-transform duration-1000" />
 </div>
 <div className="space-y-4">
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Catalog Depleted</h3>
 <p className="text-[10px] text-on-surface-variant font-semibold uppercase  opacity-40 italic leading-relaxed">System awaiting merchant initialization. Deploy assets to the global nexus.</p>
 </div>
 <Link 
 href="/seller/inventory/new" 
 className="bg-jumia-orange text-white px-16 py-6 rounded text-xs font-semibold uppercase  shadow-2xl hover:bg-jumia-orange-dark active:scale-95 transition-all group"
 >
 Deploy First Node
 <ArrowRight size={20} className="inline ml-4 group-hover:translate-x-2 transition-transform" />
 </Link>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 <ConfirmModal 
 isOpen={!!productToDelete}
 title="PURGE ASSET NODES?"
 message="This execution will permanently eliminate all variants, media assets, and stock telemetry from the global matrix. This operation is IRREVERSIBLE."
 onConfirm={() => productToDelete && deleteProduct.mutate({ id: productToDelete })}
 onCancel={() => setProductToDelete(null)}
 />
 </div>
 );
}

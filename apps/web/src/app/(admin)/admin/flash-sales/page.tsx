'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { 
 ShieldCheck, 
 Calendar, 
 DollarSign, 
 Trash, 
 Plus, 
 Zap, 
 Search, 
 Target, 
 Clock, 
 Box, 
 BarChart3,
 ChevronRight,
 TrendingUp,
 AlertCircle,
 MoreVertical,
 Loader2,
 Fingerprint
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminFlashSalesPage() {
 const utils = api.useUtils();
 const { toast } = useToast();
 const [variantSearch, setVariantSearch] = useState('');
 const { data: flashSales, isLoading: loadingSales } = api.admin.listFlashSales.useQuery();
 const { data: variants, isLoading: loadingVariants } = api.admin.listAllVariants.useQuery(
 variantSearch ? { search: variantSearch } : undefined
 );

 const [variantId, setVariantId] = useState('');
 const [salePrice, setSalePrice] = useState('');
 const [qtyLimit, setQtyLimit] = useState('');
 const [startTime, setStartTime] = useState('');
 const [endTime, setEndTime] = useState('');

 const createFlashSaleMutation = api.admin.createFlashSale.useMutation({
 onSuccess: () => {
 utils.admin.listFlashSales.invalidate();
 setVariantId('');
 setSalePrice('');
 setQtyLimit('');
 setStartTime('');
 setEndTime('');
 toast({
 title: 'STRATEGY DEPLOYED',
 description: 'Flash sale campaign has been successfully scheduled and synchronized.',
 });
 },
 onError: (err) => {
 toast({
 title: 'DEPLOYMENT FAILED',
 description: err.message || 'System failed to finalize campaign parameters.',
 variant: 'destructive',
 });
 }
 });

 const deleteFlashSaleMutation = api.admin.deleteFlashSale.useMutation({
 onSuccess: () => {
 utils.admin.listFlashSales.invalidate();
 toast({
 title: 'STRATEGY TERMINATED',
 description: 'Flash sale campaign has been purged from the registry.',
 });
 },
 onError: (err) => {
 toast({
 title: 'TERMINATION FAILED',
 description: err.message || 'System failed to finalize campaign deletion.',
 variant: 'destructive',
 });
 }
 });

 const handleCreate = (e: React.FormEvent) => {
 e.preventDefault();
 if (!variantId || !salePrice || !qtyLimit || !startTime || !endTime) {
 toast({
 title: 'INCOMPLETE DATA',
 description: 'Please ensure all campaign parameters are defined before deployment.',
 variant: 'destructive',
 });
 return;
 }

 const selectedVariant = variants?.find(v => v.id === variantId);
 if (!selectedVariant) {
 toast({
 title: 'ENTITY NOT FOUND',
 description: 'Selected variant could not be located in the inventory registry.',
 variant: 'destructive',
 });
 return;
 }

 createFlashSaleMutation.mutate({
 variantId,
 sellerId: selectedVariant.product.seller.id,
 salePrice: parseFloat(salePrice),
 qtyLimit: parseInt(qtyLimit, 10),
 startTime,
 endTime
 });
 };

 if (loadingSales) {
 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-12 animate-pulse bg-background min-h-screen">
 <div className="flex justify-between items-end mb-16">
 <div className="space-y-4">
 <div className="h-4 w-48 bg-surface-container-low rounded-full" />
 <div className="h-16 w-96 bg-surface-container-low rounded-2xl" />
 </div>
 <div className="h-12 w-48 bg-surface-container-low rounded-xl" />
 </div>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 <div className="h-[600px] bg-surface-container-low rounded-[48px] border border-surface-container-lowest" />
 <div className="h-[600px] lg:col-span-2 bg-surface-container-low rounded-[48px] border border-surface-container-lowest" />
 </div>
 </div>
 );
 }

 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30 shadow-inner">
 <ShieldCheck size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase tracking-[0.5em] text-jumia-orange italic">Promotional Strategy & Flash Liquidity Control</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Flash <br />
 <span className="text-jumia-orange italic">Strategy.</span>
 </h1>
 </div>

 <div className="flex flex-col items-end gap-3 animate-in slide-in-from-right-8 duration-1000">
 <div className="flex items-center gap-4 px-6 py-3 bg-jumia-orange border border-surface-container-low rounded-2xl shadow-3xl group">
 <Zap size={16} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Active Campaigns: {flashSales?.length || 0}</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
 {/* Create Flash Sale Form */}
 <div className="bg-surface-container-lowest p-10 rounded-[48px] border border-surface-container-low shadow-soft h-fit sticky top-8 group">
 <div className="flex items-center gap-4 mb-10 pb-6 border-b-4 border-surface-container-low">
 <div className="p-3 bg-jumia-orange/10 text-jumia-orange rounded-2xl border-2 border-jumia-orange/20 shadow-inner">
 <Plus size={20} />
 </div>
 <h2 className="text-sm font-semibold text-on-surface uppercase tracking-[0.3em] italic">Deploy Strategy</h2>
 </div>
 
 <form onSubmit={handleCreate} className="space-y-8">
 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
 Inventory Target
 </label>
 <div className="relative group/search">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/search:text-jumia-orange transition-colors" size={16} />
 <input
 type="text"
 placeholder="SEARCH SKU OR PRODUCT IDENTITY..."
 value={variantSearch}
 onChange={(e) => setVariantSearch(e.target.value)}
 className="w-full pl-12 pr-5 py-4 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl focus:outline-none focus:border-jumia-orange/20 text-[10px] font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 uppercase tracking-widest transition-all shadow-inner"
 />
 </div>
 <select
 value={variantId}
 onChange={(e) => setVariantId(e.target.value)}
 className="w-full bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl px-5 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface appearance-none cursor-pointer uppercase tracking-widest shadow-inner"
 required
 >
 <option value="">SELECT TARGET VARIANT</option>
 {variants?.map((v) => (
 <option key={v.id} value={v.id}>
 {v.product.title} - {v.sku} (₦{Number(v.price).toLocaleString()})
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
 Sale Capital (₦)
 </label>
 <input
 type="number"
 step="0.01"
 value={salePrice}
 onChange={(e) => setSalePrice(e.target.value)}
 placeholder="PRICE"
 className="w-full bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl px-5 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 shadow-inner"
 required
 />
 </div>
 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
 Unit Ceiling
 </label>
 <input
 type="number"
 value={qtyLimit}
 onChange={(e) => setQtyLimit(e.target.value)}
 placeholder="LIMIT"
 className="w-full bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl px-5 py-4 text-[10px] font-semibold focus:outline-none focus:border-jumia-orange/20 text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 shadow-inner"
 required
 />
 </div>
 </div>

 <div className="space-y-6">
 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
 Activation Timestamp
 </label>
 <div className="relative">
 <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={16} />
 <input
 type="datetime-local"
 value={startTime}
 onChange={(e) => setStartTime(e.target.value)}
 className="w-full pl-12 pr-5 py-4 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl focus:outline-none focus:border-jumia-orange/20 text-[10px] font-semibold text-on-surface shadow-inner appearance-none"
 required
 />
 </div>
 </div>

 <div className="space-y-4">
 <label className="block text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic px-2">
 Termination Timestamp
 </label>
 <div className="relative">
 <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/20" size={16} />
 <input
 type="datetime-local"
 value={endTime}
 onChange={(e) => setEndTime(e.target.value)}
 className="w-full pl-12 pr-5 py-4 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl focus:outline-none focus:border-jumia-orange/20 text-[10px] font-semibold text-on-surface shadow-inner appearance-none"
 required
 />
 </div>
 </div>
 </div>

 <button
 type="submit"
 disabled={createFlashSaleMutation.isPending}
 className="w-full bg-jumia-orange text-white py-6 rounded text-[11px] font-semibold uppercase tracking-[0.4em] italic hover:bg-jumia-orange-dark transition-all duration-700 shadow-3xl disabled:opacity-50 flex items-center justify-center gap-3 group/submit"
 >
 {createFlashSaleMutation.isPending ? (
 <>
 <Loader2 size={18} className="animate-spin text-jumia-orange" />
 Synchronizing...
 </>
 ) : (
 <>
 <Zap size={18} className="group-hover/submit:scale-110 transition-transform text-jumia-orange" />
 Deploy Strategy
 </>
 )}
 </button>
 </form>
 </div>

 {/* List of Flash Sales */}
 <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
 <div className="flex items-center justify-between px-4">
 <h3 className="text-xs font-semibold text-on-surface uppercase tracking-[0.4em] italic opacity-40">Campaign Matrix Registry</h3>
 <div className="flex items-center gap-2 text-jumia-orange bg-jumia-orange/10 px-3 py-1 rounded-full border border-jumia-orange/20">
 <BarChart3 size={12} />
 <span className="text-[10px] font-semibold uppercase tracking-widest">{flashSales?.length || 0} SECTORS</span>
 </div>
 </div>

 <div className="grid gap-6">
 {flashSales?.map((sale) => (
 <div key={sale.id} className="bg-surface-container-lowest p-10 rounded-[48px] border border-surface-container-low shadow-soft group hover:border-jumia-orange/20 hover:translate-x-4 transition-all duration-700 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-jumia-orange/5 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-[2000ms]" />
 
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
 <div className="space-y-6 flex-1">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-surface-container-low rounded-sm border-2 border-surface-container-lowest flex items-center justify-center text-on-surface-variant group-hover:bg-jumia-orange-dark/10 group-hover:text-jumia-orange transition-all duration-700 shadow-inner">
 <Box size={24} />
 </div>
 <div>
 <h4 className="text-xl font-semibold text-on-surface uppercase tracking-tighter italic leading-none mb-2">{sale.variant.product.title}</h4>
 <div className="flex flex-wrap items-center gap-4 text-[9px] font-semibold text-on-surface-variant/30 uppercase tracking-[0.2em] italic">
 <span className="flex items-center gap-1.5"><Fingerprint size={10} /> {sale.variant.sku}</span>
 <span className="flex items-center gap-1.5"><Target size={10} /> {sale.variant.product.seller.businessName}</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t-2 border-surface-container-low">
 <div className="space-y-1">
 <p className="text-[8px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.4em] italic">Unit Liquidity</p>
 <div className="flex items-center gap-2 text-on-surface font-semibold text-sm tracking-tight italic">
 <DollarSign size={14} className="text-jumia-orange" />
 ₦{Number(sale.salePrice).toLocaleString()}
 </div>
 </div>
 <div className="space-y-1">
 <p className="text-[8px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.4em] italic">Absorption Rate</p>
 <div className="flex items-center gap-3">
 <div className="flex-1 h-1.5 bg-surface-container-low rounded-full overflow-hidden border border-surface-container-lowest max-w-[100px]">
 <div className="h-full bg-jumia-orange transition-all duration-1000 ease-out" style={{ width: `${Math.min((sale.qtySold / sale.qtyLimit) * 100, 100)}%` }} />
 </div>
 <span className="text-[10px] font-semibold text-on-surface tracking-widest">{sale.qtySold} / {sale.qtyLimit}</span>
 </div>
 </div>
 <div className="space-y-1 md:col-span-1 col-span-2">
 <p className="text-[8px] font-semibold text-on-surface-variant/20 uppercase tracking-[0.4em] italic">Operational Window</p>
 <div className="flex items-center gap-2 text-on-surface-variant/60 font-semibold text-[9px] uppercase tracking-widest italic">
 <Clock size={10} />
 {new Date(sale.startTime).toLocaleDateString()} - {new Date(sale.endTime).toLocaleDateString()}
 </div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button
 onClick={() => deleteFlashSaleMutation.mutate({ id: sale.id })}
 disabled={deleteFlashSaleMutation.isPending}
 className="bg-error/5 text-error hover:bg-error hover:text-white border border-error/10 p-5 rounded duration-500 transition-all cursor-pointer shadow-soft group/delete disabled:opacity-50"
 title="TERMINATE STRATEGY"
 >
 <Trash size={20} className="group-hover/delete:rotate-12 transition-transform" />
 </button>
 <button className="p-5 bg-surface-container-low text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-lowest rounded border border-surface-container-lowest transition-all duration-500 shadow-soft">
 <MoreVertical size={20} />
 </button>
 </div>
 </div>
 </div>
 ))}
 {(!flashSales || flashSales.length === 0) && (
 <div className="bg-surface-container-lowest p-32 rounded-[56px] border border-surface-container-low text-center select-none space-y-8 group">
 <div className="w-24 h-24 bg-surface-container-low rounded border border-surface-container-lowest flex items-center justify-center mx-auto text-on-surface-variant/10 group-hover:scale-110 transition-transform duration-700">
 <TrendingUp size={48} />
 </div>
 <div className="space-y-2">
 <p className="text-[12px] font-semibold uppercase tracking-[0.6em] text-on-surface-variant/20 italic">
 Campaign matrix clear.
 </p>
 <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/10 italic">
 No flash strategies currently deployed.
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}

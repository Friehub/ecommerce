'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
 ArrowLeft, 
 Plus, 
 Trash2, 
 Upload, 
 ChevronRight,
 Package,
 Info,
 DollarSign,
 Tag,
 Cpu,
 Binary,
 Layers,
 Sparkles,
 Zap,
 Shield,
 Search,
 ChevronLeft,
 Loader2,
 Box,
 Image as ImageIcon,
 ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function NewProduct() {
 const router = useRouter();
 const utils = api.useUtils();
 const { toast } = useToast();

 const [step, setStep] = useState(1);
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 categoryId: '',
 brandId: '',
 images: [] as { url: string; key: string }[],
 variants: [
 { sku: '', price: 1, comparePrice: 0, stock: 10, attributes: {} }
 ]
 });

 const [isUploading, setIsUploading] = useState(false);

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;

 setIsUploading(true);
 try {
 const file = files[0];
 const res = await fetch('/api/media/upload', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ fileName: file.name, contentType: file.type })
 });
 
 const { uploadUrl, publicUrl, key } = await res.json();
 
 await fetch(uploadUrl, {
 method: 'PUT',
 body: file,
 headers: { 'Content-Type': file.type }
 });

 setFormData(prev => ({
 ...prev,
 images: [...prev.images, { url: publicUrl, key }]
 }));
 
 toast({
 title: 'ASSET SECURED',
 description: 'Image stream successfully synchronized with catalog storage.',
 });
 } catch (err) {
 toast({
 title: 'UPLOAD ERROR',
 description: 'Failed to synchronize image asset with remote nexus.',
 variant: 'destructive',
 });
 } finally {
 setIsUploading(false);
 }
 };

 const { data: categories } = api.catalog.getCategories.useQuery();
 const { data: brands } = api.catalog.getBrands.useQuery();
 
 const createProduct = api.catalog.createProduct.useMutation({
 onSuccess: () => {
 utils.seller.listMyProducts.invalidate();
 toast({
 title: 'PRODUCT MATERIALIZED',
 description: 'Asset has been successfully registered in the inventory matrix.',
 });
 router.push('/seller/products');
 },
 onError: (err) => {
 toast({
 title: 'MATERIALIZATION FAILED',
 description: err.message || 'System failed to finalize asset registration.',
 variant: 'destructive',
 });
 }
 });

 const handleAddVariant = () => {
 setFormData({
 ...formData,
 variants: [...formData.variants, { sku: '', price: 0, comparePrice: 0, stock: 10, attributes: {} }]
 });
 };

 const handleRemoveVariant = (index: number) => {
 if (formData.variants.length === 1) return;
 const newVariants = [...formData.variants];
 newVariants.splice(index, 1);
 setFormData({ ...formData, variants: newVariants });
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (step < 2) {
 setStep(step + 1);
 window.scrollTo({ top: 0, behavior: 'smooth' });
 } else {
 createProduct.mutate({
 title: formData.title,
 description: formData.description,
 brandId: formData.brandId,
 categoryId: formData.categoryId,
 images: formData.images.map(img => img.url),
 variants: formData.variants.map(v => ({
 sku: v.sku,
 price: Number(v.price),
 comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
 attributes: v.attributes,
 weightGrams: 500,
 stock: v.stock
 }))
 });
 }
 };

 return (
 <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <Link 
 href="/seller/products" 
 className="group flex items-center gap-3 text-on-surface-variant/40 hover:text-primary-container transition-all mb-8 w-fit"
 >
 <div className="p-2 bg-surface-container-low rounded-xl group-hover:bg-primary-container/10 transition-all border border-surface-container-low group-hover:border-primary-container/20">
 <ChevronLeft size={18} />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Back to Inventory Matrix</span>
 </Link>
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-primary-container/20 backdrop-blur-xl rounded-2xl border border-primary-container/30">
 <Plus size={24} className="text-primary-container" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Product Asset Registry & Protocol Definition</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
 Materialize <br />
 <span className="text-primary-container italic">New Asset.</span>
 </h1>
 </div>

 <div className="flex gap-6 animate-in slide-in-from-right-8 duration-1000">
 {[1, 2].map((s) => (
 <div key={s} className="flex items-center gap-4 group">
 <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-sm font-black transition-all duration-700 shadow-2xl border-4 ${
 step >= s 
 ? 'bg-primary-container text-white border-white/20' 
 : 'bg-surface-container-low text-on-surface-variant/20 border-surface-container-low'
 }`}>
 {s === 1 ? <Cpu size={22} /> : <Zap size={22} />}
 </div>
 <div className="hidden lg:block">
 <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${step >= s ? 'text-primary-container' : 'text-on-surface-variant/20'}`}>Phase 0{s}</p>
 <p className={`text-[11px] font-black uppercase tracking-widest ${step >= s ? 'text-on-surface' : 'text-on-surface-variant/20'}`}>
 {s === 1 ? 'DEFINITION' : 'LOGISTICS'}
 </p>
 </div>
 {s === 1 && <ChevronRight size={20} className="text-on-surface-variant/10 ml-2" />}
 </div>
 ))}
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-12">
 {step === 1 && (
 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[64px] p-16 shadow-soft space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center gap-8 pb-10 border-b-4 border-surface-container-low">
 <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-[24px] flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
 <Info size={32} />
 </div>
 <div>
 <h2 className="text-2xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Asset Core Identity</h2>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Global Distribution Metadata Protocol</p>
 </div>
 </div>
 
 <div className="relative z-10 space-y-10">
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic flex items-center gap-3">
 <Tag size={14} className="text-primary-container" /> Asset Label / Designation
 </label>
 <input 
 required
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="E.G. QUANTUM-X SERIE ELITE 2026..."
 className="w-full bg-surface-container-low border-4 border-surface-container-lowest rounded-[32px] px-8 py-6 text-xl font-black text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 tracking-tight focus:outline-none focus:border-primary-container/20 focus:ring-[24px] focus:ring-primary-container/5 transition-all duration-700 shadow-inner uppercase"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic flex items-center gap-3">
 <Layers size={14} className="text-primary-container" /> Classification Node
 </label>
 <select 
 required
 value={formData.categoryId}
 onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
 className="w-full bg-surface-container-low border-4 border-surface-container-lowest rounded-[28px] px-8 py-5 text-sm font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-inner appearance-none cursor-pointer uppercase tracking-widest"
 >
 <option value="">SELECT SECTOR</option>
 {categories?.map((c) => (
 <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
 ))}
 </select>
 </div>
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic flex items-center gap-3">
 <Shield size={14} className="text-primary-container" /> Brand Authorization
 </label>
 <select 
 required
 value={formData.brandId}
 onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
 className="w-full bg-surface-container-low border-4 border-surface-container-lowest rounded-[28px] px-8 py-5 text-sm font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-inner appearance-none cursor-pointer uppercase tracking-widest"
 >
 <option value="">SELECT BRAND</option>
 {brands?.map((b) => (
 <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic flex items-center gap-3">
 <Binary size={14} className="text-primary-container" /> Distribution Manifesto
 </label>
 <textarea 
 required
 rows={6}
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder="DEFINE ASSET CAPABILITIES AND TECHNICAL SPECIFICATIONS..."
 className="w-full bg-surface-container-low border-4 border-surface-container-lowest rounded-[40px] px-8 py-8 text-sm font-black text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 tracking-widest focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-inner resize-none uppercase"
 />
 </div>

 <div className="space-y-10 pt-10 border-t-4 border-surface-container-low">
 <div className="flex justify-between items-center">
 <label className="text-[12px] font-black uppercase tracking-[0.5em] text-on-surface italic">High-Fidelity Visual Documentation</label>
 <span className="text-[10px] text-primary-container font-black uppercase tracking-[0.3em] bg-primary-container/5 px-4 py-1.5 rounded-full border border-primary-container/10">05 ASSETS MAX</span>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
 {formData.images.map((img, i) => (
 <div key={i} className="aspect-square bg-surface-container-low rounded-[32px] border-4 border-surface-container-lowest relative group overflow-hidden shadow-soft hover:scale-105 transition-all duration-700">
 <img src={img.url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
 <button 
 type="button"
 onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
 className="absolute top-4 right-4 p-2.5 bg-error text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-2xl"
 >
 <Trash2 size={16} />
 </button>
 </div>
 ))}
 {formData.images.length < 5 && (
 <label className="aspect-square bg-surface-container-low rounded-[32px] border-4 border-dashed border-surface-container-lowest flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary-container/40 hover:bg-primary-container/5 transition-all duration-700 group/upload relative overflow-hidden shadow-inner">
 {isUploading ? (
 <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-container border-t-transparent" />
 ) : (
 <>
 <div className="p-4 bg-surface-container-lowest rounded-[20px] group-hover/upload:scale-110 group-hover/upload:rotate-12 transition-all duration-700 shadow-soft">
 <Plus size={28} className="text-primary-container" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 group-hover/upload:text-primary-container italic transition-colors">Inject Image</span>
 </>
 )}
 <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
 </label>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[64px] p-16 shadow-soft space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />
 
 <div className="relative z-10 flex items-center gap-8 pb-10 border-b-4 border-surface-container-low">
 <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-[24px] flex items-center justify-center border-2 border-primary-container/20 shadow-inner">
 <Zap size={32} />
 </div>
 <div>
 <h2 className="text-2xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Logistics & Capital Valuation</h2>
 <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Economic Matrix and Resource Allocation</p>
 </div>
 </div>

 <div className="relative z-10 space-y-10">
 {formData.variants.map((variant, index) => (
 <div key={index} className="p-12 bg-surface-container-low border-4 border-surface-container-lowest rounded-[48px] space-y-10 relative group/variant shadow-inner transition-all duration-700 hover:translate-x-4">
 {formData.variants.length > 1 && (
 <button 
 type="button"
 onClick={() => handleRemoveVariant(index)}
 className="absolute top-8 right-8 p-3 text-on-surface-variant/20 hover:text-error hover:bg-error/10 rounded-2xl transition-all duration-500"
 >
 <Trash2 size={20} />
 </button>
 )}
 
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-10">
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Asset SKU Identity</label>
 <input 
 required
 value={variant.sku}
 onChange={(e) => {
 const newVariants = [...formData.variants];
 newVariants[index].sku = e.target.value;
 setFormData({ ...formData, variants: newVariants });
 }}
 placeholder="E.G. S24-DARK-CORE-512..."
 className="w-full bg-surface-container-lowest border-4 border-surface-container-low rounded-[24px] px-6 py-5 text-sm font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-soft uppercase tracking-widest"
 />
 </div>
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Listing Value (₦)</label>
 <input 
 required
 type="number"
 value={variant.price}
 onChange={(e) => {
 const newVariants = [...formData.variants];
 newVariants[index].price = Number(e.target.value);
 setFormData({ ...formData, variants: newVariants });
 }}
 className="w-full bg-surface-container-lowest border-4 border-surface-container-low rounded-[24px] px-6 py-5 text-lg font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-soft"
 />
 </div>
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">MSRP Reference (₦)</label>
 <input 
 type="number"
 value={variant.comparePrice}
 onChange={(e) => {
 const newVariants = [...formData.variants];
 newVariants[index].comparePrice = Number(e.target.value);
 setFormData({ ...formData, variants: newVariants });
 }}
 className="w-full bg-surface-container-lowest border-4 border-surface-container-low rounded-[24px] px-6 py-5 text-lg font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-soft"
 />
 </div>
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Inventory Density</label>
 <input 
 required
 type="number"
 value={variant.stock}
 onChange={(e) => {
 const newVariants = [...formData.variants];
 newVariants[index].stock = Number(e.target.value);
 setFormData({ ...formData, variants: newVariants });
 }}
 className="w-full bg-surface-container-lowest border-4 border-surface-container-low rounded-[24px] px-6 py-5 text-lg font-black text-on-surface focus:outline-none focus:border-primary-container/20 transition-all duration-700 shadow-soft"
 />
 </div>
 </div>
 </div>
 ))}

 <button 
 type="button"
 onClick={handleAddVariant}
 className="w-full py-8 border-4 border-dashed border-surface-container-low rounded-[40px] flex items-center justify-center gap-5 text-on-surface-variant/20 hover:text-primary-container hover:border-primary-container/30 hover:bg-primary-container/5 transition-all duration-700 text-xs font-black uppercase tracking-[0.5em] italic shadow-inner group/add"
 >
 <div className="p-3 bg-surface-container-low rounded-2xl group-hover/add:rotate-90 transition-all duration-700">
 <Plus size={24} />
 </div>
 Append Sequence Variant
 </button>
 </div>
 </div>
 )}

 <div className="flex justify-between items-center pt-10">
 {step > 1 ? (
 <button 
 type="button"
 onClick={() => setStep(step - 1)}
 className="px-12 py-5 text-on-surface-variant/40 font-black text-[11px] hover:text-primary-container hover:bg-primary-container/5 rounded-[24px] border-4 border-surface-container-low transition-all duration-700 uppercase tracking-[0.4em] italic flex items-center gap-4 group"
 >
 <ChevronLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
 Revisit Phase 01
 </button>
 ) : <div />}
 
 <button 
 type="submit"
 disabled={createProduct.isPending}
 className="bg-on-surface text-white px-16 py-6 rounded-[28px] font-black text-[12px] hover:bg-primary-container transition-all duration-700 shadow-3xl uppercase tracking-[0.4em] italic flex items-center gap-5 group disabled:opacity-40"
 >
 {createProduct.isPending ? (
 <Loader2 className="animate-spin" size={22} />
 ) : (
 <>
 {step === 1 ? 'Finalize Definition' : 'Commit to Matrix'}
 <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform" />
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 );
}

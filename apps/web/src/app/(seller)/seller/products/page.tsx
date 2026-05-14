'use client';

import React, { useState } from 'react';
import { 
 Package, 
 Plus, 
 Search, 
 Edit2, 
 Trash2, 
 Tag, 
 ChevronRight, 
 UploadCloud,
 FileSpreadsheet,
 AlertCircle,
 CheckCircle2,
 Filter,
 MoreVertical,
 Layers,
 Cpu,
 Binary,
 Database,
 SearchCode,
 Zap,
 ArrowUpRight,
 Sparkles,
 Loader2,
 ArrowRight
} from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function SellerProductsHubPage() {
 const [csvContent, setCsvContent] = useState('');
 const [isDeleting, setIsDeleting] = useState<string | null>(null);
 const { toast } = useToast();

 const { data: remoteProducts, isLoading } = api.seller.listMyProducts.useQuery({ limit: 50, offset: 0 });

 const bulkImportMutation = api.catalog.bulkImport.useMutation({
 onSuccess: (data) => {
 toast({
 title: 'INGESTION PIPELINE ACTIVE',
 description: `Assets queued for ingestion. Job ID: ${data.jobId.slice(0, 8).toUpperCase()}`,
 });
 setCsvContent('');
 },
 onError: (err) => {
 toast({
 title: 'INGESTION ERROR',
 description: err.message || 'System failed to parse source data stream.',
 variant: 'destructive',
 });
 }
 });

 const handleDelete = (id: string) => {
 setIsDeleting(null);
 toast({
 title: 'ASSET DECOMMISSIONED',
 description: 'Product asset has been purged from active inventory matrix.',
 });
 };

 if (isLoading) {
 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 bg-background min-h-screen">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="space-y-6">
 <Skeleton className="h-16 w-96 rounded" />
 <Skeleton className="h-6 w-64 rounded-xl" />
 </div>
 <Skeleton className="h-20 w-80 rounded" />
 </div>
 <Skeleton className="h-72 w-full rounded" />
 <Skeleton className="h-[800px] w-full rounded-[64px]" />
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
 <Database size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Neural Catalog Nexus & Asset Distribution Center</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Inventory <br />
 <span className="text-jumia-orange italic">Matrix.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Unified Catalog Control • Autonomous Ingestion Logic</p>
 </div>
 <button className="bg-jumia-orange text-white px-12 py-6 rounded text-[10px] font-semibold uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl active:scale-95 flex items-center gap-4 group animate-in slide-in-from-right-8 duration-1000">
 <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
 Register New Asset
 </button>
 </div>

 {/* Bulk Ingestion Section */}
 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft p-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-jumia-orange/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-[2000ms]" />
 
 <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
 <div className="flex items-center gap-8">
 <div className="w-16 h-16 bg-jumia-orange/10 text-jumia-orange rounded flex items-center justify-center border-2 border-jumia-orange/20 shadow-inner">
 <UploadCloud size={32} />
 </div>
 <div>
 <h2 className="text-xl font-semibold text-on-surface tracking-tighter uppercase leading-none mb-2">Bulk Asset Ingestion</h2>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  opacity-40 italic">RFC-4180 COMPLIANT CSV DATA STREAM</p>
 </div>
 </div>
 <div className="flex items-center gap-5 bg-surface-container-low px-8 py-3 rounded-full border-2 border-surface-container-lowest shadow-sm">
 <FileSpreadsheet size={18} className="text-jumia-orange" />
 <span className="text-[9px] font-semibold text-on-surface-variant uppercase  italic opacity-60">Schema Validation Active</span>
 </div>
 </div>

 <div className="relative z-10 space-y-8">
 <div className="relative group/text">
 <textarea
 placeholder="PASTE CSV DATA STREAM HERE..."
 rows={4}
 value={csvContent}
 onChange={(e) => setCsvContent(e.target.value)}
 className="w-full p-10 bg-surface-container-low border border-surface-container-lowest rounded focus:outline-none focus:border-jumia-orange/20 focus:ring-[24px] focus:ring-primary-container/5 text-[14px] font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 tracking-tight transition-all duration-700 resize-none shadow-inner"
 />
 <div className="absolute top-6 right-8 text-[10px] font-semibold text-jumia-orange/20 group-focus-within/text:text-jumia-orange transition-colors italic">INPUT_Nexus_ALPHA</div>
 </div>

 <div className="flex flex-col md:flex-row md:items-center gap-10">
 <button
 onClick={() => bulkImportMutation.mutate({ csvContent })}
 disabled={!csvContent || bulkImportMutation.isPending}
 className="bg-jumia-orange text-white px-14 py-6 rounded text-[11px] font-semibold uppercase  hover:bg-jumia-orange-dark transition-all shadow-2xl disabled:opacity-20 flex items-center justify-center gap-5 group/btn"
 >
 {bulkImportMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="group-hover/btn:scale-125 transition-transform" />}
 Initialize Ingestion
 </button>
 <div className="flex items-center gap-4 p-5 bg-jumia-orange/5 rounded border-2 border-jumia-orange/10">
 <AlertCircle size={18} className="text-jumia-orange shrink-0" />
 <p className="text-[10px] font-semibold text-on-surface-variant/60 uppercase  italic leading-tight">
 REQUIRED HEADER SCHEMA: <span className="text-jumia-orange opacity-100 italic">title, sku, price, description, comparePrice, ean, stock</span>
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Catalog Matrix */}
 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="p-12 border-b-4 border-surface-container-low flex flex-col lg:flex-row gap-10 items-center bg-surface-container-low/10">
 <div className="relative flex-1 w-full group">
 <SearchCode className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-focus-within:opacity-100 group-focus-within:text-jumia-orange transition-all duration-500" size={24} />
 <input 
 type="text" 
 placeholder="QUERY CATALOG MATRIX BY SKU OR IDENTITY..."
 className="w-full pl-20 pr-10 py-6 bg-surface-container-lowest border border-surface-container-low rounded focus:outline-none focus:border-jumia-orange/20 focus:ring-[16px] focus:ring-primary-container/5 text-[14px] font-semibold text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 tracking-widest transition-all italic shadow-inner uppercase"
 />
 </div>
 <div className="flex gap-6 w-full lg:w-auto">
 <div className="relative flex-1 lg:flex-none group">
 <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 group-hover:text-jumia-orange transition-colors" size={20} />
 <select className="bg-surface-container-lowest border border-surface-container-low rounded pl-16 pr-12 py-5 text-[11px] font-semibold text-on-surface uppercase  focus:outline-none focus:border-jumia-orange/30 transition-all appearance-none cursor-pointer w-full shadow-inner hover:bg-surface-container-low/20 italic">
 <option>ALL SECTORS</option>
 <option>ACTIVE NODES</option>
 <option>DRAFT PROTOCOLS</option>
 </select>
 </div>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[1200px]">
 <thead>
 <tr className="border-b-4 border-surface-container-low text-on-surface-variant text-[10px] font-semibold uppercase  bg-surface-container-low/20 italic">
 <th className="px-12 py-8">Asset Identity / Sequence</th>
 <th className="px-12 py-8">Classification Sector</th>
 <th className="px-12 py-8">Capital Magnitude (₦)</th>
 <th className="px-12 py-8">Resource Density</th>
 <th className="px-12 py-8 text-right">Operational Control</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
  {(remoteProducts || []).map((item, idx) => {
    const mainVariant = item.variants[0];
    const totalStock = item.variants.reduce((acc, v) => 
      acc + v.stockLevels.reduce((acc2, s) => acc2 + s.qtyOnHand, 0), 0
    );
    
    return (
      <tr key={item.id} className="hover:bg-surface-container-low/30 transition-all duration-700 group animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
        <td className="px-12 py-10">
          <div className="font-semibold text-2xl text-on-surface leading-none tracking-tighter uppercase group-hover:text-jumia-orange transition-colors duration-500 cursor-pointer mb-3">
            {item.title}
          </div>
          <div className="text-[11px] font-semibold text-on-surface-variant/40 uppercase  flex items-center gap-3 italic">
            <Binary size={14} className="opacity-40" /> ID: {mainVariant?.sku || 'N/A'}
          </div>
        </td>
        <td className="px-12 py-10">
          <span className="text-[10px] font-semibold text-jumia-orange uppercase  bg-jumia-orange/5 border-2 border-jumia-orange/20 px-6 py-2 rounded-full italic shadow-sm">
            {item.category?.name || 'UNCLASSIFIED'}
          </span>
        </td>
        <td className="px-12 py-10">
          <div className="text-3xl font-semibold text-on-surface tracking-tighter leading-none">₦{Number(mainVariant?.price || 0).toLocaleString()}</div>
          <div className="text-[10px] font-semibold text-success uppercase  mt-2 italic opacity-40">Settlement Ready</div>
        </td>
        <td className="px-12 py-10">
          <div className="flex flex-col gap-3">
            <span className={`inline-flex items-center justify-center px-6 py-2 rounded-full border-2 text-[10px] font-semibold uppercase  shadow-sm italic transition-all duration-700 ${
              totalStock > 0 ? 'bg-success-container/10 text-success border-success/20' : 'bg-error-container/10 text-error border-error/20 animate-pulse'
            }`}>
              {totalStock} UNITS
            </span>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden border border-surface-container-lowest">
              <div 
                className={`h-full transition-all duration-[2000ms] ${totalStock > 0 ? 'bg-success' : 'bg-error'}`} 
                style={{ width: `${Math.min(100, (totalStock / 100) * 100)}%` }} 
              />
            </div>
          </div>
        </td>
        <td className="px-12 py-10 text-right">
          <div className="flex justify-end gap-5 opacity-0 group-hover:opacity-100 translate-x-10 group-hover:translate-x-0 transition-all duration-700">
            <button className="w-14 h-14 bg-surface-container-lowest text-on-surface-variant border border-surface-container-low hover:bg-jumia-orange hover:text-white rounded-2xl duration-700 transition-all flex items-center justify-center shadow-lg group/edit">
              <Edit2 size={24} className="group-hover/edit:rotate-12 transition-transform" />
            </button>
            <button 
              onClick={() => setIsDeleting(item.id)}
              className="w-14 h-14 bg-error-container/10 text-error border border-error/20 hover:bg-error hover:text-white rounded-2xl duration-700 transition-all flex items-center justify-center shadow-lg group/trash"
            >
              <Trash2 size={24} className="group-hover/trash:scale-125 transition-transform" />
            </button>
          </div>
        </td>
      </tr>
    );
  })}
 </tbody>
 </table>
 </div>
 </div>

 <ConfirmModal 
 isOpen={!!isDeleting}
 onCancel={() => setIsDeleting(null)}
 onConfirm={() => handleDelete(isDeleting!)}
 title="DECOMMISSION ASSET?"
 message="This protocol will permanently purge the asset from all active distribution channels. This action is immutable and irreversible."
 variant="danger"
 />
 </div>
 );
}

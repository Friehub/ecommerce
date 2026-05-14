import { prisma } from "@ecom/db";
import { Package, Warehouse, AlertTriangle, CheckCircle, Activity, Gavel, ArrowRight, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
 const stockLevels = await prisma.stockLevel.findMany({
 include: {
 variant: {
 include: {
 product: true,
 },
 },
 warehouse: true,
 },
 orderBy: {
 qtyOnHand: "asc",
 },
 });

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6 space-y-12">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-surface-container-low pb-12">
 <div className="animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-6 mb-4">
 <div className="w-16 h-16 bg-jumia-orange/10 border border-jumia-orange/20 rounded flex items-center justify-center text-jumia-orange shadow-2xl shadow-primary-container/5">
 <Warehouse size={32} strokeWidth={2.5} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Stock <span className="text-jumia-orange">Intelligence</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Real-time Synchronization Across Global Distribution Nodes and Fulfillment Arrays.</p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-surface-container-low/30 px-8 py-4 rounded border-2 border-surface-container-low">
 <Activity size={20} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-on-surface-variant">Global Inventory Sync Active</span>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-container-low/30 border-b-4 border-surface-container-low">
 <th className="px-10 py-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Product Asset</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">SKU / Node</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Warehouse Node</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Unit Velocity</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {stockLevels.map((stock, idx) => (
 <tr key={stock.id} className="hover:bg-surface-container-low/20 transition-all duration-300 group">
 <td className="px-10 py-10">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-surface-container-low rounded-sm flex items-center justify-center border-2 border-surface-container-low group-hover:scale-110 transition-all duration-500 shadow-inner">
 <Package size={24} className="text-on-surface-variant/20 group-hover:text-jumia-orange transition-colors" />
 </div>
 <div>
 <div className="text-lg font-semibold text-on-surface uppercase tracking-tighter leading-none group-hover:text-jumia-orange transition-colors mb-2">{stock.variant.product.title}</div>
 <div className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.3em] italic">Product Identity: {stock.variant.product.id.slice(-8).toUpperCase()}</div>
 </div>
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="h-10 px-4 bg-jumia-orange/5 rounded-xl flex items-center justify-center text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest italic border-2 border-on-surface/5">
 {stock.variant.sku.toUpperCase()}
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface-container-low border-2 border-surface-container-low shadow-inner">
 <Warehouse size={16} className="text-jumia-orange opacity-60" />
 <span className="text-[10px] font-semibold text-on-surface uppercase tracking-[0.2em]">{stock.warehouse.name.toUpperCase()}</span>
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="space-y-2">
 <div className="flex items-end gap-3 leading-none">
 <span className="text-3xl font-semibold text-on-surface tracking-tighter">{stock.qtyOnHand}</span>
 <span className="text-[10px] font-semibold text-on-surface-variant/30 uppercase tracking-[0.4em] mb-1 italic">Units</span>
 </div>
 <div className="flex items-center gap-2 text-[9px] font-semibold text-jumia-orange uppercase tracking-widest italic bg-jumia-orange/5 w-fit px-2 py-0.5 rounded-lg border border-jumia-orange/10">
 <Activity size={10} /> {stock.qtyReserved} Reserved
 </div>
 </div>
 </td>
 <td className="px-10 py-10">
 {stock.qtyOnHand <= 10 ? (
 <div className="inline-flex items-center gap-3 h-12 px-6 rounded-full text-[9px] font-semibold uppercase tracking-[0.4em] italic bg-error/5 text-error border-2 border-error/10 shadow-xl shadow-error/5 animate-pulse">
 <AlertTriangle size={16} />
 Critical depletion
 </div>
 ) : (
 <div className="inline-flex items-center gap-3 h-12 px-6 rounded-full text-[9px] font-semibold uppercase tracking-[0.4em] italic bg-success/5 text-success border-2 border-success/10 shadow-xl shadow-success/5">
 <CheckCircle size={16} />
 Protocol Nominal
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {stockLevels.length === 0 && (
 <div className="py-40 text-center px-10">
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center mx-auto mb-10 opacity-20 border border-surface-container-low">
 <Warehouse size={48} />
 </div>
 <h3 className="text-3xl font-semibold text-on-surface uppercase tracking-tighter">Inventory Null</h3>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-6 italic leading-relaxed">NO STOCK ENTITIES DETECTED WITHIN THE CENTRAL DISTRIBUTION MATRIX.</p>
 </div>
 )}
 </div>
 </div>
 
 <div className="mt-12 bg-jumia-orange text-white rounded p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-jumia-orange/20 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:scale-125 transition-transform duration-1000" />
 <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center border-2 border-white/10 shadow-inner">
 <ShieldCheck size={40} className="text-jumia-orange" />
 </div>
 <div>
 <h3 className="text-2xl font-semibold uppercase tracking-tighter mb-2">Inventory <span className="text-jumia-orange">Integrity</span></h3>
 <p className="text-[10px] font-semibold uppercase tracking-[0.2em] italic opacity-40 max-w-3xl leading-loose">
 STOCK MAGNITUDE IS SYNCED EVERY 60 SECONDS ACROSS ALL DISTRIBUTION NODES. DISCREPANCIES TRIGGER AUTOMATIC OPERATIONAL AUDITS.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-6 bg-white/5 px-8 py-5 rounded border-2 border-white/10 shrink-0">
 <div className="flex flex-col items-end">
 <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">Node-Alpha Sync</span>
 <span className="text-[9px] font-semibold text-jumia-orange uppercase tracking-[0.2em] italic mt-1">In Stock</span>
 </div>
 <Activity size={24} className="text-jumia-orange animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

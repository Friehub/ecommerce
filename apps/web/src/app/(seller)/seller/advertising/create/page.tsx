'use client';

import { api } from '@/trpc/react';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateCampaign() {
 const router = useRouter();
 const utils = api.useUtils();
 
 const [name, setName] = useState('');
 const [budget, setBudget] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');

 const createMutation = api.advertising.createCampaign.useMutation({
 onSuccess: () => {
 utils.advertising.getCampaigns.invalidate();
 router.push('/seller/advertising');
 }
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!name || !budget || !startDate) return;
 
 createMutation.mutate({
 name,
 budget: Number(budget),
 startDate: new Date(startDate),
 endDate: endDate ? new Date(endDate) : undefined
 });
 };

 return (
 <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700">
 <Link href="/seller/advertising" className="inline-flex items-center text-on-surface-variant/40 hover:text-jumia-orange text-[10px] font-semibold uppercase  mb-8 transition-colors group">
 <ArrowLeft size={14} className="mr-3 group-hover:-translate-x-2 transition-transform" /> Protocol Dashboard
 </Link>

 <div className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft overflow-hidden">
 <div className="p-10 border-b-4 border-surface-container-low bg-surface-container-low/10">
 <h1 className="text-2xl font-semibold text-on-surface uppercase tracking-tight">Initialize Campaign</h1>
 <p className="text-on-surface-variant/40 text-[10px] font-semibold uppercase  mt-1 italic">Set up a new sponsored node within the ecosystem.</p>
 </div>

 <form onSubmit={handleSubmit} className="p-10 space-y-8">
 <div className="space-y-3">
 <label className="block text-[9px] font-semibold text-on-surface-variant/40 uppercase  ml-2 italic">Campaign Designation</label>
 <input 
 type="text" 
 required
 value={name}
 onChange={e => setName(e.target.value)}
 className="w-full h-14 px-6 border-2 border-surface-container-low rounded-2xl focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="e.g. SUMMER_ELECTRONICS_NODE"
 />
 </div>

 <div className="space-y-3">
 <label className="block text-[9px] font-semibold text-on-surface-variant/40 uppercase  ml-2 italic">Operational Budget (₦)</label>
 <input 
 type="number" 
 required
 min="1000"
 step="100"
 value={budget}
 onChange={e => setBudget(e.target.value)}
 className="w-full h-14 px-6 border-2 border-surface-container-low rounded-2xl focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="5000"
 />
 <p className="text-[8px] text-on-surface-variant/30 font-semibold uppercase mt-2  italic border-l-2 border-jumia-orange pl-3">Campaign will automatically pause when budget is exhausted.</p>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-3">
 <label className="block text-[9px] font-semibold text-on-surface-variant/40 uppercase  ml-2 italic">Activation Date</label>
 <input 
 type="date" 
 required
 value={startDate}
 onChange={e => setStartDate(e.target.value)}
 className="w-full h-14 px-6 border-2 border-surface-container-low rounded-2xl focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300"
 />
 </div>
 <div className="space-y-3">
 <label className="block text-[9px] font-semibold text-on-surface-variant/40 uppercase  ml-2 italic">Termination (Optional)</label>
 <input 
 type="date" 
 value={endDate}
 onChange={e => setEndDate(e.target.value)}
 className="w-full h-14 px-6 border-2 border-surface-container-low rounded-2xl focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300"
 />
 </div>
 </div>

 <div className="pt-8 border-t-4 border-surface-container-low flex justify-end">
 <button 
 type="submit"
 disabled={createMutation.isLoading}
 className="bg-jumia-orange text-white px-10 py-5 rounded-sm font-semibold text-[11px] uppercase  hover:bg-jumia-orange-dark transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-4 group"
 >
 {createMutation.isLoading ? <Loader2 size={18} className="animate-spin" /> : (
 <>
 Commit Campaign <Save size={18} className="group-hover:scale-110 transition-transform" />
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}

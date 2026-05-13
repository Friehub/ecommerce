'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Users, Shield, ShieldAlert, CheckCircle2, XCircle, Search, Filter, MoreHorizontal, ArrowUpRight, Activity, Gavel } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AdminSellersPage() {
 const utils = api.useUtils();
 const [search, setSearch] = React.useState('');
 const [statusFilter, setStatusFilter] = React.useState('All');

 const { data: sellers, isLoading } = api.admin.listAllSellers.useQuery();
 
 const filteredSellers = sellers?.filter(s => {
 const matchesSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) || 
 s.user.email.toLowerCase().includes(search.toLowerCase());
 const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const updateStatus = api.admin.updateSellerStatus.useMutation({
 onSuccess: () => utils.admin.listAllSellers.invalidate()
 });

 const approveKYC = api.admin.approveSeller.useMutation({
 onSuccess: () => utils.admin.listAllSellers.invalidate()
 });

 if (isLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40 animate-pulse">Syncing Entity Registry</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-[1600px] mx-auto px-6 space-y-12">
 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b-4 border-surface-container-low pb-12">
 <div className="animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-6 mb-6">
 <div className="w-16 h-16 bg-primary-container/10 border-4 border-primary-container/20 rounded-[24px] flex items-center justify-center text-primary-container shadow-2xl shadow-primary-container/5">
 <Users size={32} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">Merchant <span className="text-primary-container">Registry</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Management of vendor identities, tiering, and operational authorization.</p>
 </div>
 </div>
 </div>
 
 <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
 <div className="relative group w-full md:w-96">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-primary-container transition-colors" size={18} />
 <input 
 type="text" 
 placeholder="QUERY ENTITY IDENTITY..." 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-16 pr-6 h-16 bg-surface-container-lowest border-4 border-surface-container-low rounded-[32px] focus:border-primary-container transition-all outline-none font-black text-[10px] uppercase tracking-widest text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 shadow-soft"
 />
 </div>
 <div className="flex items-center gap-3 bg-surface-container-lowest border-4 border-surface-container-low rounded-[32px] p-2 shadow-soft overflow-x-auto no-scrollbar">
 {['All', 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-8 h-12 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
 statusFilter === status 
 ? 'bg-on-surface text-white shadow-2xl' 
 : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-low'
 }`}
 >
 {status.replace('_', ' ')}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-[64px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-container-low/30 border-b-4 border-surface-container-low">
 <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Entity / Node</th>
 <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Protocol Status</th>
 <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Tier Index</th>
 <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic">Temporal Log</th>
 <th className="px-10 py-8 text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 italic text-right">Overrides</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {filteredSellers?.map((seller, idx) => (
 <tr key={seller.id} className="hover:bg-surface-container-low/20 transition-all duration-300 group">
 <td className="px-10 py-10">
 <div className="font-black text-on-surface text-xl uppercase tracking-tighter group-hover:text-primary-container transition-colors leading-none mb-2">{seller.businessName}</div>
 <div className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">{seller.user.email.toUpperCase()}</div>
 </td>
 <td className="px-10 py-10">
 <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-xl border-2 ${
 seller.status === 'ACTIVE' 
 ? 'bg-success/5 text-success border-success/10' 
 : seller.status === 'SUSPENDED'
 ? 'bg-error/5 text-error border-error/10'
 : 'bg-primary-container/5 text-primary-container border-primary-container/10 animate-pulse'
 }`}>
 {seller.status.replace('_', ' ')}
 </span>
 </td>
 <td className="px-10 py-10">
 <div className="flex flex-col gap-1">
 <div className="text-[10px] font-black text-on-surface uppercase tracking-widest italic">{seller.tier} SELLER</div>
 <div className="flex items-center gap-2 text-[10px] text-primary-container font-black">
 <Star size={14} className="fill-primary-container" /> {Number(seller.rating).toFixed(1)} <span className="opacity-20">TRUST</span>
 </div>
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="flex flex-col gap-1">
 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{format(new Date(seller.createdAt), 'dd MMM yyyy').toUpperCase()}</span>
 <span className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.2em] italic">ESTABLISHED</span>
 </div>
 </td>
 <td className="px-10 py-10 text-right">
 <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
 {seller.status === 'PENDING_VERIFICATION' && (
 <>
 <Link 
 href={`/admin/kyc?sellerId=${seller.id}`}
 className="w-14 h-14 bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-white rounded-2xl flex items-center justify-center border-2 border-primary-container/20 transition-all active:scale-90 shadow-xl shadow-primary-container/5"
 title="Review KYC Documents"
 >
 <Shield size={22} />
 </Link>
 <button 
 onClick={() => approveKYC.mutate({ sellerId: seller.id })}
 className="w-14 h-14 bg-success/10 text-success hover:bg-success hover:text-white rounded-2xl flex items-center justify-center border-2 border-success/20 transition-all active:scale-90 shadow-xl shadow-success/5"
 title="Quick Approve"
 >
 <CheckCircle2 size={22} />
 </button>
 </>
 )}
 {seller.status === 'ACTIVE' ? (
 <button 
 onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'SUSPENDED' })}
 className="w-14 h-14 bg-error/5 text-error hover:bg-error hover:text-white rounded-2xl flex items-center justify-center border-2 border-error/10 transition-all active:scale-90 shadow-xl shadow-error/5"
 title="Suspend Seller"
 >
 <ShieldAlert size={22} />
 </button>
 ) : (
 <button 
 onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'ACTIVE' })}
 className="w-14 h-14 bg-success/5 text-success hover:bg-success hover:text-white rounded-2xl flex items-center justify-center border-2 border-success/10 transition-all active:scale-90 shadow-xl shadow-success/5"
 title="Activate Seller"
 >
 <CheckCircle2 size={22} />
 </button>
 )}
 <button className="w-14 h-14 bg-surface-container-low text-on-surface-variant hover:bg-on-surface hover:text-white rounded-2xl flex items-center justify-center border-2 border-surface-container-low transition-all active:scale-90">
 <MoreHorizontal size={22} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {!isLoading && sellers?.length === 0 && (
 <div className="py-40 text-center animate-in fade-in duration-1000">
 <Users size={80} className="mx-auto text-surface-container-low mb-10 opacity-40" />
 <h3 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Registry <span className="text-primary-container">Empty</span></h3>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-6 italic">NO ENTITIES DETECTED MATCHING THE CURRENT FILTER PARAMETERS.</p>
 </div>
 )}
 </div>
 </div>
 
 <div className="mt-12 bg-on-surface text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:scale-125 transition-transform duration-1000" />
 <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-20 h-20 bg-white/10 rounded-[28px] flex items-center justify-center border-2 border-white/10">
 <Gavel size={32} className="text-primary-container" />
 </div>
 <div>
 <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Administrative <span className="text-primary-container">Override</span></h3>
 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40 max-w-3xl leading-loose">
 AUTHORIZATION OVERRIDES ARE LOGGED WITHIN THE SYSTEMIC AUDIT TRAIL. ENSURE ENTITY COMPLIANCE WITH TERMS OF SERVICE BEFORE STATUS MANIPULATION.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded-[24px] border-2 border-white/10 shrink-0">
 <Activity size={20} className="text-primary-container animate-pulse" />
 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Governance Protocol Active</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

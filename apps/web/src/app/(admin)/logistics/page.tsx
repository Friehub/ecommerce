'use client';

import { api } from '@/trpc/react';
import { useState } from "react";
import { Package, Truck, User, ArrowRight, Loader2, CheckCircle, Clock, Activity, Gavel, ShieldCheck } from 'lucide-react';

export default function LogisticsAdminPage() {
 const { data: shipments, refetch: refetchShipments, isLoading: shipmentsLoading } = api.logistics.listAllShipments.useQuery();
 const { data: agents } = api.logistics.listAgents.useQuery();
 const assignAgent = api.logistics.assignAgent.useMutation({
 onSuccess: () => refetchShipments(),
 });

 const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

 const handleAssign = (shipmentId: string) => {
 const agentId = selectedAgent[shipmentId];
 if (!agentId) return;
 assignAgent.mutate({ shipmentId, agentId });
 };

 if (shipmentsLoading) {
 return (
 <div className="bg-background min-h-screen flex items-center justify-center">
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border border-jumia-orange/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-semibold uppercase  text-on-surface-variant opacity-40 animate-pulse">Syncing Transit Notifications</p>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-7xl mx-auto px-6 space-y-12">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-surface-container-low pb-12">
 <div className="animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="flex items-center gap-6 mb-4">
 <div className="w-16 h-16 bg-jumia-orange/10 border border-jumia-orange/20 rounded flex items-center justify-center text-jumia-orange shadow-2xl shadow-primary-container/5">
 <Truck size={32} strokeWidth={2.5} />
 </div>
 <div>
 <h1 className="text-4xl md:text-5xl font-semibold text-on-surface uppercase tracking-tighter leading-none">Logistics <span className="text-jumia-orange">Command</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mt-4 italic">Operational Control Center for Global Transit and Asset Deployment.</p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-surface-container-low/30 px-8 py-4 rounded border-2 border-surface-container-low">
 <Activity size={20} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase  text-on-surface-variant">Active Notifications: {shipments?.length || 0} Assets</span>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-[64px] border border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface-container-low/30 border-b-4 border-surface-container-low">
 <th className="px-10 py-8 text-[9px] font-semibold uppercase  text-on-surface-variant/40 italic">Asset Identity</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase  text-on-surface-variant/40 italic">Destination Node</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase  text-on-surface-variant/40 italic">Notifications Status</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase  text-on-surface-variant/40 italic">Assigned Agent</th>
 <th className="px-10 py-8 text-[9px] font-semibold uppercase  text-on-surface-variant/40 italic text-right">Operations</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {shipments?.map((shipment, idx) => (
 <tr key={shipment.id} className="hover:bg-surface-container-low/20 transition-all duration-300 group">
 <td className="px-10 py-10">
 <div className="flex items-center gap-6">
 <div className="w-14 h-14 bg-surface-container-low rounded-sm flex items-center justify-center border-2 border-surface-container-low group-hover:scale-110 transition-all duration-500 shadow-inner">
 <Package size={24} className="text-on-surface-variant/20 group-hover:text-jumia-orange transition-colors" />
 </div>
 <div>
 <div className="text-lg font-semibold text-on-surface uppercase tracking-tighter leading-none group-hover:text-jumia-orange transition-colors mb-2">#{shipment.packageId.slice(0, 12).toUpperCase()}</div>
 <div className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  italic">Asset Hash: {shipment.id.slice(-8).toUpperCase()}</div>
 </div>
 </div>
 </td>
 <td className="px-10 py-10">
 <div className="flex flex-col gap-1">
 <p className="text-[11px] font-semibold text-on-surface uppercase tracking-tight">LAGOS DISTRIBUTION HUB</p>
 <p className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-widest italic">WESTERN NODE-01</p>
 </div>
 </td>
 <td className="px-10 py-10">
 <div className={`inline-flex items-center gap-3 h-10 px-6 rounded-full text-[9px] font-semibold uppercase  italic border-2 shadow-xl ${
 shipment.status === 'DELIVERED' 
 ? 'bg-success/5 text-success border-success/10' 
 : 'bg-jumia-orange/5 text-jumia-orange border-jumia-orange/10'
 }`}>
 <div className={`w-2 h-2 rounded-full ${shipment.status === 'DELIVERED' ? 'bg-success' : 'bg-jumia-orange animate-pulse shadow-[0_0_10px_rgba(var(--primary-container),0.6)]'}`} />
 {shipment.status}
 </div>
 </td>
 <td className="px-10 py-10">
 {shipment.agent ? (
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-jumia-orange/5 rounded-xl flex items-center justify-center border-2 border-on-surface/5 shadow-inner">
 <User size={16} className="text-on-surface-variant/40" />
 </div>
 <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest italic">{shipment.agentId.slice(0, 12).toUpperCase()}</span>
 </div>
 ) : (
 <div className="relative group/select">
 <select 
 value={selectedAgent[shipment.id] || ''}
 onChange={(e) => setSelectedAgent({ ...selectedAgent, [shipment.id]: e.target.value })}
 className="bg-surface-container-low border-2 border-surface-container-low h-14 px-6 pr-12 rounded-sm text-[10px] font-semibold uppercase tracking-widest text-on-surface outline-none focus:border-jumia-orange transition-all appearance-none cursor-pointer w-full"
 >
 <option value="">AWAITING SELECTION</option>
 {agents?.map(agent => (
 <option key={agent.id} value={agent.id}>AGENT: {agent.id.slice(0, 8).toUpperCase()}</option>
 ))}
 </select>
 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
 <ArrowRight size={16} className="rotate-90" />
 </div>
 </div>
 )}
 </td>
 <td className="px-10 py-10 text-right">
 {!shipment.agent && (
 <button 
 onClick={() => handleAssign(shipment.id)}
 disabled={!selectedAgent[shipment.id] || assignAgent.isLoading}
 className="h-16 px-10 bg-jumia-orange text-white rounded font-semibold text-[10px] uppercase  hover:bg-jumia-orange-dark disabled:opacity-20 transition-all active:scale-95 shadow-2xl flex items-center gap-4 ml-auto group/btn"
 >
 {assignAgent.isLoading ? <Loader2 className="animate-spin" size={18} /> : (
 <>
 DEPLOY OPERATIVE <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 )}
 {shipment.status === 'DELIVERED' && (
 <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center border-2 border-success/10 ml-auto shadow-xl">
 <ShieldCheck size={24} />
 </div>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {(!shipments || shipments.length === 0) && (
 <div className="py-40 text-center px-10">
 <div className="w-24 h-24 bg-surface-container-low rounded flex items-center justify-center mx-auto mb-10 opacity-20 border border-surface-container-low animate-pulse">
 <Clock size={48} />
 </div>
 <h3 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter">Feed Idle</h3>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mt-6 italic leading-relaxed">SYNCHRONIZING GLOBAL SHIPMENT FEED NODES...</p>
 </div>
 )}
 </div>
 </div>
 
 <div className="mt-12 bg-jumia-orange text-white rounded p-10 shadow-2xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-jumia-orange/20 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:scale-125 transition-transform duration-1000" />
 <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
 <div className="flex items-center gap-8">
 <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center border-2 border-white/10">
 <Gavel size={32} className="text-jumia-orange" />
 </div>
 <div>
 <h3 className="text-2xl font-semibold uppercase tracking-tighter mb-2">Transit <span className="text-jumia-orange">Governance</span></h3>
 <p className="text-[10px] font-semibold uppercase  italic opacity-40 max-w-3xl leading-loose">
 ALL OPERATIVE DEPLOYMENTS ARE IRREVOCABLE AND TRACKED VIA REAL-TIME GEOSPATIAL TELEMETRY NODES. ENSURE AGENT AVAILABILITY BEFORE MISSION ASSIGNMENT.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-4 bg-white/5 px-8 py-5 rounded border-2 border-white/10 shrink-0">
 <Activity size={20} className="text-jumia-orange animate-pulse" />
 <span className="text-[10px] font-semibold uppercase ">Logistics Protocol Active</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

'use client';

import { api } from '@/trpc/react';
import { useState } from "react";
import { Package, Truck, User, ArrowRight, Loader2, CheckCircle, Clock, Activity, Gavel, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

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
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
                <Truck size={20} className="text-jumia-orange" />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Fulfillment Center</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Logistics <span className="text-jumia-orange">Management</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage shipments and delivery agent assignments</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <Activity size={16} className="text-jumia-orange animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Active Shipments: {shipments?.length || 0}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background/50 text-[9px] font-black uppercase tracking-widest text-j-text-muted/60 border-b border-j-border">
                  <th className="px-8 py-5">Shipment ID</th>
                  <th className="px-8 py-5">Destination Hub</th>
                  <th className="px-8 py-5">Shipment Status</th>
                  <th className="px-8 py-5">Assigned Agent</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {shipments?.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-j-background/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-j-background rounded-sm flex items-center justify-center text-j-text-muted border border-j-border group-hover:border-jumia-orange/30 transition-colors">
                          <Package size={18} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors">
                            #{shipment.packageId.slice(0, 12).toUpperCase()}
                          </div>
                          <div className="text-[10px] font-black text-j-text-muted/40 uppercase tracking-widest mt-0.5">
                            ID: {shipment.id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-j-text uppercase">Lagos Distribution Hub</p>
                        <p className="text-[9px] font-black text-j-text-muted/40 uppercase tracking-widest mt-0.5">Main Hub Area 1</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        shipment.status === 'DELIVERED' 
                          ? 'bg-green-50 text-j-success border-green-100' 
                          : 'bg-orange-50 text-jumia-orange border-orange-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${shipment.status === 'DELIVERED' ? 'bg-j-success' : 'bg-jumia-orange animate-pulse'}`} />
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {shipment.agent ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-j-background rounded-sm flex items-center justify-center border border-j-border">
                            <User size={14} className="text-j-text-muted/60" />
                          </div>
                          <span className="text-[10px] font-black text-j-text uppercase tracking-tight">{shipment.agentId.slice(0, 12).toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="relative w-full max-w-[200px]">
                          <select 
                            value={selectedAgent[shipment.id] || ''}
                            onChange={(e) => setSelectedAgent({ ...selectedAgent, [shipment.id]: e.target.value })}
                            className="w-full h-10 px-4 bg-j-background border border-j-border rounded-sm text-[10px] font-black uppercase tracking-widest text-j-text outline-none focus:border-jumia-orange transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select Agent</option>
                            {agents?.map(agent => (
                              <option key={agent.id} value={agent.id}>Agent: {agent.id.slice(0, 8).toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {!shipment.agent && (
                        <button 
                          onClick={() => handleAssign(shipment.id)}
                          disabled={!selectedAgent[shipment.id] || assignAgent.isPending}
                          className="h-10 px-6 bg-jumia-orange text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 ml-auto"
                        >
                          {assignAgent.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Assign Agent'}
                        </button>
                      )}
                      {shipment.status === 'DELIVERED' && (
                        <div className="w-10 h-10 bg-green-50 text-j-success rounded-sm flex items-center justify-center border border-green-100 ml-auto">
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(!shipments || shipments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <div className="w-16 h-16 bg-j-background rounded-full flex items-center justify-center border border-j-border mb-2 opacity-20">
                          <Clock size={32} />
                        </div>
                        <h3 className="text-xl font-black text-j-text uppercase tracking-tight">No Active Shipments</h3>
                        <p className="text-j-text-muted text-[10px] font-black uppercase tracking-widest opacity-60">All shipments are currently processed or delivered.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info Section */}
        <div className="bg-j-text text-white rounded-sm p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center border border-white/10 shadow-inner">
                <Gavel size={24} className="text-jumia-orange" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Fulfillment <span className="text-jumia-orange">Policies</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 max-w-2xl leading-relaxed">
                  All delivery assignments are tracked in real-time. Ensure agent availability and route optimization before assigning shipments to maintain delivery SLAs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-sm">
              <Activity size={16} className="text-jumia-orange animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Logistics System Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

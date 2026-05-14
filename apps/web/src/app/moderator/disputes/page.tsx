'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { 
  AlertCircle, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Scale, 
  Gavel, 
  Activity, 
  ArrowRight, 
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ModeratorDisputesDashboard() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: disputes, isLoading } = api.dispute.listAllDisputes.useQuery();
  const resolveMutation = api.dispute.resolveDispute.useMutation({
    onSuccess: () => {
      utils.dispute.listAllDisputes.invalidate();
      setSelectedDispute(null);
      toast({
        title: 'Dispute Resolved',
        description: 'The dispute has been successfully processed.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Could not resolve dispute.',
        variant: 'destructive',
      });
    }
  });

  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);

  const handleResolve = (status: 'RESOLVED' | 'REJECTED') => {
    if (!selectedDispute || !resolution) return;
    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      resolution,
      status,
      refundAmount: refundAmount || 0
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-j-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="lg:col-span-8 h-[600px] w-full rounded-sm" />
          <Skeleton className="lg:col-span-4 h-[600px] w-full rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <Gavel size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Customer Support</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Dispute <span className="text-jumia-orange">Resolution</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Manage customer complaints and refund requests</p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <Activity size={14} className="text-j-success animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">System Status: Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Dispute List Queue */}
          <div className="lg:col-span-8 bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-j-border bg-j-background/30 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">Pending Disputes</h2>
            </div>

            {disputes && disputes.length > 0 ? (
              <div className="divide-y divide-j-border">
                {disputes.map((dispute: any) => (
                  <div 
                    key={dispute.id} 
                    onClick={() => setSelectedDispute(dispute)}
                    className={`p-6 flex items-center justify-between hover:bg-j-background cursor-pointer transition-all border-l-4 ${
                      selectedDispute?.id === dispute.id ? 'border-jumia-orange bg-j-background' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-sm border flex items-center justify-center transition-all ${
                        dispute.status === 'OPEN' 
                          ? 'bg-red-50 text-j-error border-red-100' 
                          : 'bg-green-50 text-j-success border-green-100'
                      }`}>
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                          <span className="font-black text-j-text text-base uppercase tracking-tight">Case #{dispute.id.slice(-8).toUpperCase()}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                            dispute.status === 'OPEN' 
                              ? 'bg-red-50 text-j-error border-red-100' 
                              : 'bg-green-50 text-j-success border-green-100'
                          }`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest opacity-60 line-clamp-1 italic">{dispute.reason}</p>
                        <p className="text-[8px] font-black text-j-text-muted/40 mt-1 uppercase tracking-widest">
                          By: {dispute.buyer?.email}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className={`transition-all ${selectedDispute?.id === dispute.id ? 'text-jumia-orange translate-x-1' : 'text-j-text-muted/20'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center opacity-20">
                <ShieldCheck className="mx-auto mb-6" size={64} />
                <h3 className="text-xl font-black text-j-text uppercase tracking-tight mb-2">No Disputes Found</h3>
                <p className="text-[10px] font-black uppercase tracking-widest">Great job! All disputes have been resolved.</p>
              </div>
            )}
          </div>

          {/* Resolution Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-sm border border-j-border shadow-sm p-8">
              <h2 className="text-[10px] font-black text-j-text uppercase tracking-widest mb-8 border-b border-j-border pb-4 opacity-40">
                Resolution Details
              </h2>

              {selectedDispute ? (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase text-j-text-muted tracking-widest opacity-40">Reason for Dispute</span>
                    <p className="text-[10px] font-black text-j-text uppercase tracking-widest bg-j-background border border-j-border p-4 rounded-sm italic leading-relaxed">
                      {selectedDispute.reason}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-j-text-muted tracking-widest opacity-40 block">Official Resolution</label>
                    <textarea
                      placeholder="ENTER RESOLUTION DETAILS..."
                      rows={5}
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full p-4 bg-j-background border border-j-border rounded-sm focus:border-jumia-orange text-[10px] font-black text-j-text uppercase tracking-widest placeholder:text-j-text-muted/30 transition-all outline-none shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-j-text-muted tracking-widest opacity-40 block">Refund Amount (₦)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-j-background border border-j-border rounded-sm focus:border-jumia-orange text-[10px] font-black text-j-text uppercase tracking-widest transition-all outline-none shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <button
                      onClick={() => handleResolve('RESOLVED')}
                      disabled={!resolution || resolveMutation.isPending}
                      className="bg-j-success text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all shadow-md hover:bg-j-success/90 flex items-center gap-2 justify-center disabled:opacity-30"
                    >
                      <CheckCircle size={16} /> Resolve Dispute
                    </button>
                    <button
                      onClick={() => handleResolve('REJECTED')}
                      disabled={!resolution || resolveMutation.isPending}
                      className="bg-j-error text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all shadow-md hover:bg-j-error/90 flex items-center gap-2 justify-center disabled:opacity-30"
                    >
                      <XCircle size={16} /> Reject Dispute
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center border border-dashed border-j-border rounded-sm opacity-20">
                  <Scale className="mx-auto mb-4" size={40} />
                  <p className="text-[9px] font-black uppercase tracking-widest px-4">
                    Select a dispute from the queue to start resolution
                  </p>
                </div>
              )}
            </div>

            <div className="bg-j-text text-white rounded-sm p-8 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-jumia-orange/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h3 className="text-base font-black uppercase tracking-tight mb-3 relative z-10">Moderator <span className="text-jumia-orange">Guideline</span></h3>
              <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed relative z-10 opacity-60">
                All decisions are final and will be communicated to both buyer and seller. Ensure fairness in your judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

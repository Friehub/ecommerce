'use client';

import { api } from '@/trpc/react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  XCircle, 
  File, 
  ExternalLink, 
  Loader2,
  AlertCircle,
  Briefcase,
  User,
  MoreVertical,
  History,
  Search,
  Fingerprint,
  ChevronRight,
  ShieldAlert,
  Gavel
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminKYCVerificationPage() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: kycQueue, isLoading } = api.admin.getPendingSellers.useQuery();

  const approveMutation = api.admin.approveSeller.useMutation({
    onSuccess: () => {
      utils.admin.getPendingSellers.invalidate();
      toast({
        title: 'Seller Approved',
        description: 'Seller credentials verified and account activated successfully.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Approval Failed',
        description: err.message || 'Could not approve seller.',
        variant: 'destructive',
      });
    }
  });

  const updateStatusMutation = api.admin.updateSellerStatus.useMutation({
    onSuccess: () => {
      utils.admin.getPendingSellers.invalidate();
      toast({
        title: 'Status Updated',
        description: 'Seller moderation status has been updated.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update seller status.',
        variant: 'destructive',
      });
    }
  });

  const handleUpdate = (sellerId: string, action: 'APPROVED' | 'REJECTED') => {
    if (action === 'APPROVED') {
      approveMutation.mutate({ sellerId });
    } else {
      updateStatusMutation.mutate({ sellerId, status: 'REJECTED' });
    }
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
        <Skeleton className="h-[600px] w-full rounded-sm" />
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
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Compliance Control</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Seller <span className="text-jumia-orange">Verifications</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Review and approve seller registration documents</p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Pending Reviews: {kycQueue?.length || 0}</span>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden">
          <div className="p-6 border-b border-j-border bg-j-background/30">
            <div className="relative group flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30 group-focus-within:text-jumia-orange transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="SEARCH BY BUSINESS NAME OR EMAIL..."
                className="w-full pl-12 pr-6 py-3 bg-white border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[11px] font-black text-j-text placeholder:font-black placeholder:text-j-text-muted/30 transition-all uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background text-[10px] font-black uppercase text-j-text-muted/50 tracking-widest border-b border-j-border">
                  <th className="px-6 py-4">Seller Details</th>
                  <th className="px-6 py-4">Documents</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {kycQueue?.map((item) => (
                  <tr key={item.id} className="hover:bg-j-background transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-j-background rounded-sm border border-j-border flex items-center justify-center text-j-text-muted group-hover:text-jumia-orange group-hover:border-jumia-orange/30 transition-all shadow-inner">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <div className="font-black text-xs text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors">
                            {item.businessName}
                          </div>
                          <div className="text-[9px] font-black text-j-text-muted uppercase tracking-widest mt-1 opacity-60">
                            {item.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-2">
                        {item.documents?.map((doc: any) => (
                          <a 
                            key={doc.id}
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-j-background px-3 py-1.5 rounded-sm border border-j-border hover:border-jumia-orange/30 transition-all group/doc"
                          >
                            <File size={12} className="text-j-text-muted group-hover/doc:text-jumia-orange" />
                            <span className="text-[8px] font-black text-j-text-muted uppercase tracking-widest group-hover/doc:text-jumia-orange">{doc.type}</span>
                            <ExternalLink size={10} className="text-j-text-muted/30" />
                          </a>
                        ))}
                        {(!item.documents || item.documents.length === 0) && (
                          <span className="text-[8px] font-black text-j-text-muted/40 uppercase tracking-widest italic">No documents uploaded</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-all ${
                        item.status === 'PENDING_VERIFICATION' ? 'bg-orange-50 text-jumia-orange border-orange-100 animate-pulse' :
                        item.status === 'ACTIVE' ? 'bg-green-50 text-j-success border-green-100' :
                        'bg-red-50 text-j-error border-red-100'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === 'PENDING_VERIFICATION' && (
                          <>
                            <button 
                              onClick={() => handleUpdate(item.id, 'APPROVED')}
                              disabled={approveMutation.isPending}
                              className="p-2 bg-green-50 text-j-success border border-green-100 rounded-sm hover:bg-j-success hover:text-white transition-all shadow-sm"
                              title="Approve Seller"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleUpdate(item.id, 'REJECTED')}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 bg-red-50 text-j-error border border-red-100 rounded-sm hover:bg-j-error hover:text-white transition-all shadow-sm"
                              title="Reject Seller"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-j-text hover:text-j-text transition-all shadow-sm">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

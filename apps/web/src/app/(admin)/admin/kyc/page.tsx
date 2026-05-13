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
 Fingerprint
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
 title: 'ENTITY AUTHORIZED',
 description: 'Seller credentials verified and account activated successfully.',
 });
 },
 onError: (err) => {
 toast({
 title: 'AUTHORIZATION FAILED',
 description: err.message || 'System failed to finalize seller approval.',
 variant: 'destructive',
 });
 }
 });

 const updateStatusMutation = api.admin.updateSellerStatus.useMutation({
 onSuccess: () => {
 utils.admin.getPendingSellers.invalidate();
 toast({
 title: 'STATUS RECONCILED',
 description: 'Moderation record updated in the global registry.',
 });
 },
 onError: (err) => {
 toast({
 title: 'MODERATION FAILED',
 description: err.message || 'System failed to finalize status update.',
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
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-12 animate-pulse bg-background min-h-screen">
 <div className="flex justify-between items-end mb-16">
 <div className="space-y-4">
 <div className="h-4 w-48 bg-surface-container-low rounded-full" />
 <div className="h-16 w-96 bg-surface-container-low rounded-2xl" />
 </div>
 <div className="h-12 w-48 bg-surface-container-low rounded-xl" />
 </div>
 <div className="bg-surface-container-low rounded-[48px] h-[600px] border-4 border-surface-container-lowest" />
 </div>
 );
 }

 return (
 <div className="max-w-[1400px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-primary-container/20 backdrop-blur-xl rounded-2xl border border-primary-container/30 shadow-inner">
 <ShieldCheck size={24} className="text-primary-container" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-container italic">Compliance Verification & Merchant Onboarding Protocol</span>
 </div>
 <h1 className="text-5xl md:text-7xl font-black text-on-surface uppercase tracking-tighter leading-[0.85]">
 Moderation <br />
 <span className="text-primary-container italic">Queue.</span>
 </h1>
 </div>

 <div className="flex flex-col items-end gap-3 animate-in slide-in-from-right-8 duration-1000">
 <div className="flex items-center gap-4 px-6 py-3 bg-surface-container-low border-2 border-surface-container-lowest rounded-2xl shadow-soft">
 <Fingerprint size={16} className="text-on-surface-variant/40" />
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">Registry Load: {kycQueue?.length || 0} Entities</span>
 </div>
 <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] italic text-right">Verification Latency: ~14.2m</p>
 </div>
 </div>

 {/* Moderation Matrix */}
 <div className="bg-surface-container-lowest border-4 border-surface-container-low rounded-[56px] shadow-soft overflow-hidden group">
 <div className="p-10 border-b-4 border-surface-container-low flex flex-col lg:flex-row gap-8 items-center bg-surface-container-low/20">
 <div className="relative flex-1 w-full group/search">
 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within/search:text-primary-container transition-colors" size={20} />
 <input 
 type="text" 
 placeholder="SEARCH BY BUSINESS NAME, ENTITY ID OR TAX PROTOCOL..."
 className="w-full pl-16 pr-8 py-5 bg-surface-container-low border-4 border-surface-container-lowest rounded-[28px] focus:outline-none focus:border-primary-container/20 focus:ring-[20px] focus:ring-primary-container/5 text-xs font-black text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50 shadow-inner transition-all duration-700 uppercase tracking-widest"
 />
 </div>
 </div>

 <div className="overflow-x-auto custom-scrollbar">
 <table className="w-full text-left border-collapse min-w-[1000px]">
 <thead>
 <tr className="bg-surface-container-low/10 text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/30 border-b-4 border-surface-container-low">
 <th className="px-10 py-8 italic">Merchant Entity</th>
 <th className="px-10 py-8 italic">Document Registry</th>
 <th className="px-10 py-8 italic">Protocol Status</th>
 <th className="px-10 py-8 text-right italic">Moderation Controls</th>
 </tr>
 </thead>
 <tbody className="divide-y-4 divide-surface-container-low">
 {kycQueue?.map((item) => (
 <tr key={item.id} className="hover:bg-primary-container/5 transition-all duration-700 group/row">
 <td className="px-10 py-8">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 bg-surface-container-low rounded-[20px] border-2 border-surface-container-lowest flex items-center justify-center text-on-surface-variant group-hover/row:bg-primary-container/10 group-hover/row:text-primary-container transition-all duration-700 shadow-inner">
 <Briefcase size={24} />
 </div>
 <div>
 <div className="font-black text-sm md:text-base text-on-surface uppercase tracking-tight leading-none mb-1 group-hover/row:translate-x-2 transition-transform duration-700">
 {item.businessName}
 </div>
 <div className="flex items-center gap-2 text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] italic">
 <User size={10} /> {item.user.email}
 </div>
 </div>
 </div>
 </td>
 <td className="px-10 py-8">
 <div className="flex flex-col gap-3">
 {item.documents?.map((doc: any) => (
 <div key={doc.id} className="flex items-center gap-4 bg-surface-container-low/40 p-3 rounded-2xl border-2 border-surface-container-lowest hover:border-primary-container/20 transition-all duration-500 group/doc">
 <div className="w-8 h-8 bg-surface-container-low rounded-xl flex items-center justify-center shrink-0 border border-surface-container-lowest group-hover/doc:bg-primary-container/10 group-hover/doc:text-primary-container transition-all duration-500">
 <File size={14} />
 </div>
 <div className="flex-1 min-w-0">
 <span className="font-black text-[9px] text-on-surface-variant uppercase tracking-widest block truncate leading-none mb-1">{doc.type}</span>
 <a 
 href={doc.url} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-[8px] font-black text-primary-container uppercase tracking-[0.3em] flex items-center gap-1.5 cursor-pointer hover:underline opacity-60 hover:opacity-100"
 >
 ACCESS BLOB <ExternalLink size={8} />
 </a>
 </div>
 </div>
 ))}
 {(!item.documents || item.documents.length === 0) && (
 <div className="flex items-center gap-3 opacity-20">
 <AlertCircle size={14} />
 <span className="text-[9px] font-black uppercase tracking-widest italic">Registry Void: No Blobs Detected</span>
 </div>
 )}
 </div>
 </td>
 <td className="px-10 py-8">
 <span className={`text-[10px] px-4 py-1.5 rounded-full font-black border-2 uppercase tracking-[0.2em] italic transition-all duration-700 ${
 item.status === 'PENDING_VERIFICATION' ? 'bg-primary-container/10 text-primary-container border-primary-container/20 shadow-[0_0_15px_rgba(246,139,30,0.2)] animate-pulse' :
 item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
 'bg-error/10 text-error border-error/20'
 }`}>
 {item.status.replace('_', ' ')}
 </span>
 </td>
 <td className="px-10 py-8 text-right">
 <div className="flex justify-end gap-3">
 {item.status === 'PENDING_VERIFICATION' && (
 <>
 <button 
 onClick={() => handleUpdate(item.id, 'APPROVED')}
 disabled={approveMutation.isPending}
 className="bg-green-500/5 text-green-500 hover:bg-green-500 hover:text-white border-4 border-green-500/10 p-4 rounded-2xl duration-500 transition-all cursor-pointer shadow-soft group/btn disabled:opacity-50"
 title="AUTHORIZE ENTITY"
 >
 <CheckCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
 </button>
 <button 
 onClick={() => handleUpdate(item.id, 'REJECTED')}
 disabled={updateStatusMutation.isPending}
 className="bg-error/5 text-error hover:bg-error hover:text-white border-4 border-error/10 p-4 rounded-2xl duration-500 transition-all cursor-pointer shadow-soft group/btn disabled:opacity-50"
 title="REJECT ENTITY"
 >
 <XCircle size={20} className="group-hover/btn:rotate-12 transition-transform" />
 </button>
 </>
 )}
 <button className="p-4 bg-surface-container-low text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-lowest rounded-2xl border-4 border-surface-container-lowest transition-all duration-500 shadow-soft">
 <History size={20} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {kycQueue?.length === 0 && (
 <tr>
 <td colSpan={4} className="px-10 py-32 text-center select-none space-y-6">
 <div className="w-20 h-20 bg-surface-container-low rounded-[32px] border-4 border-surface-container-lowest flex items-center justify-center mx-auto text-on-surface-variant/20">
 <ShieldCheck size={40} />
 </div>
 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-on-surface-variant/20 italic">
 Registry clear. all entities reconciled.
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

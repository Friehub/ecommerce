'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { 
 Shield, 
 Upload, 
 CheckCircle, 
 AlertCircle, 
 FileText, 
 Loader2, 
 Camera, 
 ShieldCheck,
 Lock,
 ArrowRight,
 Info,
 CheckCircle2,
 XCircle,
 Cpu,
 Fingerprint,
 Globe,
 Binary,
 Workflow,
 Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SellerKYCPage() {
 const router = useRouter();
 const utils = api.useUtils();
 const { toast } = useToast();
 const [uploading, setUploading] = useState<string | null>(null);

 const { data: seller, isLoading } = api.seller.getProfile.useQuery();
 
 const uploadDoc = api.seller.uploadDocument.useMutation({
 onSuccess: () => {
 utils.seller.getProfile.invalidate();
 setUploading(null);
 toast({
 title: 'IDENTITY SECURED',
 description: 'Verification asset has been ingested and queued for neural audit.',
 });
 }
 });

 const getPresignedUrl = api.media.getUploadUrl.useMutation();

 const handleFileUpload = async (type: 'NIN' | 'BANK_STATEMENT' | 'CAC' | 'UTILITY_BILL', file: File) => {
 try {
 setUploading(type);
 
 const { url, key } = await getPresignedUrl.mutateAsync({
 path: `kyc/${type.toLowerCase()}-${Date.now()}-${file.name}`,
 contentType: file.type
 });

 const uploadResponse = await fetch(url, {
 method: 'PUT',
 body: file,
 headers: { 'Content-Type': file.type }
 });

 if (!uploadResponse.ok) throw new Error('System rejected the asset stream.');

 const publicUrl = `${process.env.NEXT_PUBLIC_R2_URL || 'https://media.jumia-clone.com'}/${key}`;
 await uploadDoc.mutateAsync({ type, url: publicUrl });

 } catch (error) {
 toast({
 title: 'INGESTION FAILED',
 description: (error as any).message || 'Asset verification encounterd a fatal error.',
 variant: 'destructive',
 });
 } finally {
 setUploading(null);
 }
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
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {[...Array(4)].map((_, i) => (
 <Skeleton key={i} className="h-72 w-full rounded" />
 ))}
 </div>
 </div>
 );
 }

 const docStatus = (type: string) => {
 const doc = seller?.documents?.find(d => d.type === type);
 return doc ? doc.status : 'NOT_SUBMITTED';
 };

 const isVerified = seller?.status === 'ACTIVE';

 const docTypes = [
 { id: 'NIN', label: 'Government ID (NIN)', desc: 'Valid sovereign identification protocol.' },
 { id: 'BANK_STATEMENT', label: 'Financial Record', desc: 'Active statement (L3M) verifying resource liquidity.' },
 { id: 'CAC', label: 'CAC Certificate', desc: 'Business registry documentation (T2 Matrix).' },
 { id: 'UTILITY_BILL', label: 'Utility Mandate', desc: 'Spatially verified address via service utility.' },
 ];

 return (
 <div className="max-w-[1600px] mx-auto px-6 py-16 space-y-16 select-none bg-background min-h-screen animate-in fade-in duration-1000">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
 <div className="animate-in slide-in-from-left-8 duration-1000">
 <div className="flex items-center gap-4 mb-6">
 <div className="p-2.5 bg-jumia-orange/20 backdrop-blur-xl rounded-2xl border border-jumia-orange/30">
 <Fingerprint size={24} className="text-jumia-orange" />
 </div>
 <span className="text-[10px] font-semibold uppercase  text-jumia-orange italic">Neural Identity Nexus & Compliance Authority</span>
 </div>
 <h1 className="text-5xl md:text-8xl font-semibold text-on-surface uppercase tracking-tighter leading-[0.85]">
 Compliance <br />
 <span className="text-jumia-orange italic">Nexus.</span>
 </h1>
 <p className="text-on-surface-variant text-[10px] font-semibold uppercase  mt-8 opacity-40 italic border-l-4 border-jumia-orange pl-8">Automated Merchant Authorization • Global Identity Synchronization</p>
 </div>
 {isVerified && (
 <div className="bg-success-container/10 text-success px-12 py-5 rounded flex items-center gap-4 text-[11px] font-semibold uppercase  border-2 border-success/20 shadow-2xl shadow-success/5 animate-in slide-in-from-right-8 duration-1000 italic">
 <ShieldCheck size={22} className="animate-pulse" /> Verified Merchant
 </div>
 )}
 </div>

 {!isVerified && (
 <div className="bg-surface-container-lowest border border-surface-container-low rounded-[64px] p-12 flex flex-col md:flex-row gap-10 items-center shadow-soft animate-in slide-in-from-bottom-8 duration-1000">
 <div className="w-24 h-24 bg-jumia-orange text-white rounded flex items-center justify-center shrink-0 shadow-2xl border border-surface-container-low group-hover:scale-110 transition-transform duration-700">
 <AlertCircle size={48} />
 </div>
 <div className="text-center md:text-left">
 <h3 className="text-2xl font-semibold text-on-surface uppercase tracking-tighter leading-none mb-3">Authorization Required</h3>
 <p className="text-[12px] font-semibold text-on-surface-variant uppercase  opacity-60 leading-relaxed max-w-3xl italic">
 Merchant registry requires a valid <span className="text-jumia-orange opacity-100 border-b-2 border-jumia-orange/20 pb-0.5">Sovereign Identity Card</span> and <span className="text-jumia-orange opacity-100 border-b-2 border-jumia-orange/20 pb-0.5">Financial Liquidity Statement</span> for high-throughput node activation and settlement synchronization.
 </p>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 {docTypes.map((docType, idx) => {
 const status = docStatus(docType.id);
 return (
 <div key={docType.id} className="bg-surface-container-lowest border border-surface-container-low rounded-[56px] p-12 shadow-soft hover:translate-y-[-12px] transition-all duration-700 group animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${idx * 150}ms` }}>
 <div className="flex items-start justify-between mb-10">
 <div className="w-20 h-20 bg-surface-container-low rounded flex items-center justify-center text-on-surface-variant/20 group-hover:text-jumia-orange transition-all duration-1000 border-2 border-outline-variant/5 shadow-inner">
 <FileText size={40} strokeWidth={1.5} />
 </div>
 <div className={`px-6 py-2.5 rounded-full text-[10px] font-semibold uppercase  border-2 shadow-sm italic transition-all duration-700 ${
 status === 'APPROVED' ? 'bg-success-container/10 text-success border-success/20' :
 status === 'PENDING' ? 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20 animate-pulse' :
 status === 'REJECTED' ? 'bg-error-container/10 text-error border-error/20' :
 'bg-surface-container-low text-on-surface-variant/30 border-outline-variant/10'
 }`}>
 {status.replace('_', ' ')}
 </div>
 </div>
 
 <h3 className="font-semibold text-on-surface uppercase tracking-tighter text-2xl mb-3 group-hover:text-jumia-orange transition-colors duration-500">{docType.label}</h3>
 <p className="text-[11px] text-on-surface-variant/40 font-semibold uppercase  mb-12 italic">{docType.desc}</p>

 {status === 'APPROVED' ? (
 <div className="flex items-center gap-4 text-success text-[11px] font-semibold uppercase  bg-success-container/10 p-6 rounded border-2 border-success/20 italic shadow-inner">
 <ShieldCheck size={22} className="animate-bounce-subtle" /> Asset Verification Secured
 </div>
 ) : (
 <div className="relative group/upload overflow-hidden rounded-[36px]">
 <input 
 type="file" 
 accept="image/*,.pdf"
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (file) handleFileUpload(docType.id as any, file);
 }}
 disabled={!!uploading}
 />
 <button className={`w-full py-7 rounded-[36px] border border-dashed border-outline-variant/10 flex items-center justify-center gap-5 text-[11px] font-semibold uppercase  transition-all duration-700 italic relative ${uploading === docType.id ? 'bg-surface-container-low' : 'group-hover/upload:bg-jumia-orange group-hover/upload:text-white group-hover/upload:border-on-surface group-hover/upload:shadow-2xl'}`}>
 {uploading === docType.id ? (
 <Loader2 size={24} className="animate-spin text-jumia-orange" />
 ) : (
 <>
 <Upload size={24} className="group-hover/upload:scale-125 transition-transform duration-500" />
 {status === 'REJECTED' ? 'Recalibrate Asset Stream' : 'Ingest Verification Identity'}
 </>
 )}
 </button>
 </div>
 )}
 </div>
 );
 })}
 </div>

 <div className="bg-jumia-orange rounded-[72px] p-20 text-white relative overflow-hidden shadow-3xl animate-in fade-in slide-in-from-bottom-10 duration-1000 border border-surface-container-low">
 <div className="absolute top-0 right-0 w-full h-full bg-jumia-orange/5 rounded-full blur-[150px] animate-pulse" />
 <div className="relative z-10 space-y-12">
 <div className="flex items-center gap-5">
 <div className="w-12 h-12 bg-jumia-orange text-white rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/10">
 <Lock size={24} />
 </div>
 <span className="text-[12px] font-semibold uppercase  text-jumia-orange italic">High-Fidelity Encryption Protocol Active</span>
 </div>
 <h2 className="text-6xl md:text-7xl font-semibold uppercase tracking-tighter leading-[0.85] max-w-3xl">
 Sovereign Data <br />Protection <span className="text-jumia-orange italic">Engaged.</span>
 </h2>
 <p className="text-base text-white/40 font-semibold uppercase  max-w-2xl leading-relaxed italic border-l-4 border-jumia-orange/30 pl-10">
 All identity assets are encrypted at rest via specialized hardware security modules. Data access is strictly compartmentalized and audited by authorized compliance nodes.
 </p>
 <div className="flex items-center gap-8 pt-6">
 <div className="flex -space-x-5">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="w-14 h-14 rounded-full border border-on-surface bg-surface-container-low/20 backdrop-blur-2xl flex items-center justify-center shadow-xl">
 <ShieldCheck size={20} className="text-jumia-orange" />
 </div>
 ))}
 </div>
 <div>
 <p className="text-[10px] font-semibold uppercase  opacity-40 mb-1">Institutional Integrity</p>
 <div className="flex items-center gap-3">
 <Globe size={14} className="text-jumia-orange" />
 <span className="text-[13px] font-semibold uppercase tracking-tighter text-white/60">System Trust Verified: 99.99%</span>
 </div>
 </div>
 </div>
 </div>
 <div className="absolute top-1/2 right-[-15%] -translate-y-1/2 opacity-5 rotate-12 scale-150 pointer-events-none group-hover:rotate-45 transition-transform duration-[3000ms]">
 <Shield size={800} strokeWidth={1} />
 </div>
 </div>
 </div>
 );
}

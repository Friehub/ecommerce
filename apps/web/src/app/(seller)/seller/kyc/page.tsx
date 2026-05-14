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
        title: 'Document Uploaded',
        description: 'Your document has been submitted for review.',
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

      if (!uploadResponse.ok) throw new Error('Failed to upload file.');

      const publicUrl = `${process.env.NEXT_PUBLIC_R2_URL || 'https://media.jumia-clone.com'}/${key}`;
      await uploadDoc.mutateAsync({ type, url: publicUrl });

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: (error as any).message || 'An error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-sm" />
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
    { id: 'NIN', label: 'Government ID (NIN)', desc: 'National Identity Number card or slip.' },
    { id: 'BANK_STATEMENT', label: 'Bank Statement', desc: 'Recent 3 months statement for business verification.' },
    { id: 'CAC', label: 'CAC Certificate', desc: 'Corporate Affairs Commission registration documents.' },
    { id: 'UTILITY_BILL', label: 'Utility Bill', desc: 'Recent bill (Electricity/Water) for address verification.' },
  ];

  return (
    <div className="max-w-[1184px] mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <Fingerprint size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Seller Verification</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface uppercase tracking-tight leading-none">
            Compliance & <span className="text-jumia-orange">Security</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Complete your verification to start selling on Jumia</p>
        </div>
        {isVerified && (
          <div className="bg-green-50 text-success px-8 py-3 rounded-sm flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm animate-in slide-in-from-right-8">
            <ShieldCheck size={20} /> Verified Seller
          </div>
        )}
      </div>

      {!isVerified && (
        <div className="bg-white border border-outline-variant/10 rounded-sm p-8 flex flex-col md:flex-row gap-8 items-center shadow-sm">
          <div className="w-16 h-16 bg-jumia-orange text-white rounded-sm flex items-center justify-center shrink-0">
            <AlertCircle size={32} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-black text-on-surface uppercase tracking-tight mb-2">Action Required: Complete Verification</h3>
            <p className="text-[10px] font-black text-on-surface-variant uppercase leading-relaxed max-w-2xl opacity-60">
              To activate your store and start receiving orders, please upload a valid <span className="text-on-surface">Government ID</span> and <span className="text-on-surface">Utility Bill</span> for review.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {docTypes.map((docType) => {
          const status = docStatus(docType.id);
          return (
            <div key={docType.id} className="bg-white border border-outline-variant/10 rounded-sm p-8 shadow-sm hover:border-jumia-orange/30 transition-all group">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-surface-container-low rounded-sm flex items-center justify-center text-on-surface-variant/40 group-hover:text-jumia-orange transition-colors border border-outline-variant/5">
                  <FileText size={28} />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  status === 'APPROVED' ? 'bg-green-50 text-success border-green-100' :
                  status === 'PENDING' ? 'bg-orange-50 text-jumia-orange border-orange-100' :
                  status === 'REJECTED' ? 'bg-red-50 text-error border-red-100' :
                  'bg-surface-container-low text-on-surface-variant/40 border-outline-variant/10'
                }`}>
                  {status.replace('_', ' ')}
                </div>
              </div>
              
              <h3 className="font-black text-on-surface uppercase tracking-tight text-lg mb-2 group-hover:text-jumia-orange transition-colors">{docType.label}</h3>
              <p className="text-[10px] text-on-surface-variant font-black uppercase mb-8 opacity-60 leading-relaxed">{docType.desc}</p>

              {status === 'APPROVED' ? (
                <div className="flex items-center gap-3 text-success text-[9px] font-black uppercase bg-green-50 p-5 rounded-sm border border-green-100">
                  <CheckCircle2 size={18} /> Verification Complete
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-sm group/upload">
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
                  <button className={`w-full h-14 rounded-sm border border-dashed border-outline-variant/50 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${uploading === docType.id ? 'bg-surface-container-low' : 'bg-white hover:bg-jumia-orange hover:text-white hover:border-jumia-orange'}`}>
                    {uploading === docType.id ? (
                      <Loader2 size={18} className="animate-spin text-jumia-orange" />
                    ) : (
                      <>
                        <Upload size={18} />
                        {status === 'REJECTED' ? 'Re-upload Document' : 'Upload Document'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-on-surface rounded-sm p-12 text-white relative overflow-hidden shadow-lg border border-black">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center border border-white/20">
              <Lock size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-jumia-orange">Secure Data Protection</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-none max-w-2xl">
            Your Information is <span className="text-jumia-orange">Encrypted & Secure</span>
          </h2>
          <p className="text-sm text-white/60 font-black uppercase max-w-xl leading-relaxed opacity-80 border-l-2 border-jumia-orange/40 pl-6">
            All uploaded documents are encrypted at rest and handled according to our strict privacy policy. Your data is only used for compliance and verification purposes.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-on-surface bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <ShieldCheck size={16} className="text-jumia-orange" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[8px] font-black uppercase opacity-40 mb-1">Jumia Security Standard</p>
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-jumia-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Verified Trust Protocol</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none translate-x-1/4 scale-150">
          <Shield size={400} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
}

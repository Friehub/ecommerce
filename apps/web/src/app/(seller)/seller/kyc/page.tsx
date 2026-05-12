'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/react';
import { Shield, Upload, CheckCircle, AlertCircle, FileText, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SellerKYCPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: seller, isLoading } = api.seller.getProfile.useQuery();
  
  const uploadDoc = api.seller.uploadDocument.useMutation({
    onSuccess: () => {
      utils.seller.getProfile.invalidate();
      setUploading(null);
    }
  });

  const getPresignedUrl = api.media.getUploadUrl.useMutation();

  const handleFileUpload = async (type: 'NIN' | 'BANK_STATEMENT' | 'CAC' | 'UTILITY_BILL', file: File) => {
    try {
      setUploading(type);
      
      // 1. Get presigned URL
      const { url, key } = await getPresignedUrl.mutateAsync({
        path: `kyc/${type.toLowerCase()}-${file.name}`,
        contentType: file.type
      });

      // 2. Upload to S3/R2
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // 3. Register document in DB
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_URL || 'https://media.jumia-clone.com'}/${key}`;
      await uploadDoc.mutateAsync({ type, url: publicUrl });

    } catch (error) {
      alert('Upload failed: ' + (error as any).message);
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-gray-400">Loading profile...</div>;

  const docStatus = (type: string) => {
    const doc = seller?.documents?.find(d => d.type === type);
    return doc ? doc.status : 'NOT_SUBMITTED';
  };

  const isVerified = seller?.status === 'ACTIVE';

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 select-none">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <Shield size={32} className="text-[#f68b1e]" />
            KYC VERIFICATION
          </h1>
          <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">Complete your identity verification to start selling.</p>
        </div>
        {isVerified && (
          <div className="bg-green-100 text-green-700 px-6 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-green-200">
            <ShieldCheck size={16} /> Verified Seller
          </div>
        )}
      </div>

      {!isVerified && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex gap-4 items-start">
          <AlertCircle className="text-[#f68b1e] shrink-0" size={24} />
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Onboarding Required</h3>
            <p className="text-xs text-gray-600 font-medium leading-relaxed mt-1 uppercase tracking-tight">
              You must upload both a valid [NIN] and a recent [BANK STATEMENT] to be automatically activated.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'NIN', label: 'National ID (NIN)', desc: 'Valid government issued identity card.' },
          { id: 'BANK_STATEMENT', label: 'Bank Statement', desc: 'Recent statement (last 3 months) showing your name.' },
          { id: 'CAC', label: 'CAC Certificate', desc: 'Business registration (Optional for T1).' },
          { id: 'UTILITY_BILL', label: 'Utility Bill', desc: 'Electricity or Water bill for address verification.' },
        ].map((docType) => (
          <div key={docType.id} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-black/[0.02] transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#f68b1e]/10 group-hover:text-[#f68b1e] transition-colors">
                <FileText size={24} />
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                docStatus(docType.id) === 'APPROVED' ? 'bg-green-100 text-green-700' :
                docStatus(docType.id) === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                docStatus(docType.id) === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {docStatus(docType.id).replace('_', ' ')}
              </div>
            </div>
            
            <h3 className="font-black text-gray-900 uppercase tracking-tight">{docType.label}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-8">{docType.desc}</p>

            {docStatus(docType.id) === 'APPROVED' ? (
              <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle size={16} /> Document Verified
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(docType.id as any, file);
                  }}
                  disabled={!!uploading}
                />
                <button className={`w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${uploading === docType.id ? 'bg-gray-50' : 'group-hover:border-[#f68b1e] group-hover:text-[#f68b1e]'}`}>
                  {uploading === docType.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      {docStatus(docType.id) === 'REJECTED' ? 'RE-UPLOAD DOCUMENT' : 'UPLOAD DOCUMENT'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
             <Shield className="text-[#f68b1e]" size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f68b1e]">Security Standard</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight max-w-lg">
            Your data is encrypted and stored securely.
          </h2>
          <p className="text-sm text-gray-400 font-medium max-w-md uppercase tracking-tight">
            Documents are only visible to authorized compliance officers for verification purposes. We do not share your sensitive info with third parties.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Shield size={200} />
        </div>
      </div>
    </div>
  );
}

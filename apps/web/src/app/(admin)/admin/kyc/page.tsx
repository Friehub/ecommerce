'use client';

import { api } from '@/trpc/react';
import { ShieldCheck, FileText, CheckCircle, XCircle, File, ExternalLink, Loader2 } from 'lucide-react';

export default function AdminKYCVerificationPage() {
  const utils = api.useUtils();
  const { data: kycQueue, isLoading } = api.admin.getPendingSellers.useQuery();

  const approveMutation = api.admin.approveSeller.useMutation({
    onSuccess: () => {
      utils.admin.getPendingSellers.invalidate();
      alert('Seller approved!');
    }
  });

  const updateStatusMutation = api.admin.updateSellerStatus.useMutation({
    onSuccess: () => {
      utils.admin.getPendingSellers.invalidate();
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Verification Queue...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
          <FileText className="text-[#F68B1E]" /> SELLER KYC VERIFICATION QUEUE
        </h1>
        <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
          Approve or reject uploaded business and identity documents for onboarding sellers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Seller Details</th>
                <th className="px-6 py-4">Document Details</th>
                <th className="px-6 py-4">Status / Action</th>
                <th className="px-6 py-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {kycQueue?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/40 duration-200 transition-all select-none">
                   <td className="px-6 py-4">
                    <div className="font-extrabold text-xs md:text-sm text-gray-900 leading-tight tracking-tight">{item.businessName}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">{item.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {item.documents?.map((doc: any) => (
                        <div key={doc.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <File size={16} className="text-gray-400" />
                          </div>
                          <div className="max-w-[200px] truncate">
                            <span className="font-extrabold text-[10px] text-gray-700 block truncate">{doc.type}</span>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-[#264996] uppercase tracking-wider flex items-center gap-1 mt-0.5 cursor-pointer hover:underline"
                            >
                              VIEW <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      ))}
                      {(!item.documents || item.documents.length === 0) && (
                        <span className="text-[10px] text-gray-400 italic">No documents uploaded</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-xl font-extrabold border uppercase tracking-wider ${
                      item.status === 'PENDING_VERIFICATION' ? 'bg-orange-50 text-orange-600 border-orange-100/60' :
                      item.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100/60' :
                      'bg-red-50 text-red-600 border-red-100/60'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === 'PENDING_VERIFICATION' && (
                        <>
                          <button 
                            onClick={() => handleUpdate(item.id, 'APPROVED')}
                            disabled={approveMutation.isLoading}
                            className="bg-green-50 hover:bg-green-100/70 border border-green-100/50 text-green-600 p-2 rounded-xl duration-200 transition-all cursor-pointer hover:shadow-sm disabled:opacity-50"
                            title="Approve Seller"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(item.id, 'REJECTED')}
                            disabled={updateStatusMutation.isLoading}
                            className="bg-red-50 hover:bg-red-100/70 border border-red-100/50 text-red-600 p-2 rounded-xl duration-200 transition-all cursor-pointer hover:shadow-sm disabled:opacity-50"
                            title="Reject Seller"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {kycQueue?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400 select-none text-xs font-bold uppercase tracking-widest">
                    The KYC moderation queue is completely clear.
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

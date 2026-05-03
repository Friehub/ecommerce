'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle, XCircle, File, ExternalLink } from 'lucide-react';

export default function AdminKYCVerificationPage() {
  const [kycQueue, setKycQueue] = useState([
    { id: '1', businessName: 'Corporate Electro Ltd', email: 'corporate@electro.dev', docs: 'cac_registration.pdf', date: '2026-05-01', status: 'PENDING' },
    { id: '2', businessName: 'Gadgets Pro Inc.', email: 'admin@gadgets.dev', docs: 'tax_clearance.pdf', date: '2026-05-02', status: 'PENDING' },
    { id: '3', businessName: 'Dynamic Fashion Hub', email: 'orders@dynamic.dev', docs: 'id_verification.png', date: '2026-05-02', status: 'PENDING' },
  ]);

  const handleUpdate = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setKycQueue(kycQueue.map((item) => {
      if (item.id === id) {
        return { ...item, status: action };
      }
      return item;
    }));
  };

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
              {kycQueue.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/40 duration-200 transition-all select-none">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-xs md:text-sm text-gray-900 leading-tight tracking-tight">{item.businessName}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">{item.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <File size={16} className="text-gray-400" />
                      </div>
                      <div className="max-w-[200px] truncate">
                        <span className="font-extrabold text-xs text-gray-700 block truncate">{item.docs}</span>
                        <span className="text-[10px] font-bold text-[#264996] uppercase tracking-wider flex items-center gap-1 mt-0.5 cursor-pointer hover:underline">
                          PREVIEW <ExternalLink size={10} />
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-xl font-extrabold border uppercase tracking-wider ${
                      item.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100/60' :
                      item.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100/60' :
                      'bg-red-50 text-red-600 border-red-100/60'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleUpdate(item.id, 'APPROVED')}
                            className="bg-green-50 hover:bg-green-100/70 border border-green-100/50 text-green-600 p-2 rounded-xl duration-200 transition-all cursor-pointer hover:shadow-sm"
                            title="Approve Seller"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(item.id, 'REJECTED')}
                            className="bg-red-50 hover:bg-red-100/70 border border-red-100/50 text-red-600 p-2 rounded-xl duration-200 transition-all cursor-pointer hover:shadow-sm"
                            title="Reject Seller"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {item.status !== 'PENDING' && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision finalized</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {kycQueue.length === 0 && (
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

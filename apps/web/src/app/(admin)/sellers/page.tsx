'use client';

import React from 'react';
import { api } from '../../../trpc/react';
import { Users, Shield, ShieldAlert, CheckCircle2, XCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSellersPage() {
  const utils = api.useUtils();
  const { data: sellers, isLoading } = api.admin.listAllSellers.useQuery();
  
  const updateStatus = api.admin.updateSellerStatus.useMutation({
    onSuccess: () => utils.admin.listAllSellers.invalidate()
  });

  const approveKYC = api.admin.approveSeller.useMutation({
    onSuccess: () => utils.admin.listAllSellers.invalidate()
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <Users size={28} className="text-[#f68b1e]" />
            Seller Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor, verify, and manage platform sellers.</p>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by business name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded focus:outline-none focus:border-[#f68b1e] text-sm"
            />
          </div>
          <select className="bg-white border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f68b1e]">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4">Business / Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tier / Rating</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : sellers?.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{seller.businessName}</div>
                    <div className="text-xs text-gray-500">{seller.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                      seller.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700' 
                        : seller.status === 'SUSPENDED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {seller.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-700">{seller.tier}</div>
                    <div className="flex items-center gap-1 text-[10px] text-[#f68b1e] font-bold">
                      ★ {Number(seller.rating).toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {format(new Date(seller.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {seller.status === 'PENDING_VERIFICATION' && (
                        <button 
                          onClick={() => approveKYC.mutate({ sellerId: seller.id })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Approve KYC"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      {seller.status === 'ACTIVE' ? (
                        <button 
                          onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'SUSPENDED' })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Suspend Seller"
                        >
                          <ShieldAlert size={18} />
                        </button>
                      ) : seller.status === 'SUSPENDED' ? (
                        <button 
                          onClick={() => updateStatus.mutate({ sellerId: seller.id, status: 'ACTIVE' })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Activate Seller"
                        >
                          <Shield size={18} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && sellers?.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm italic">
              No sellers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

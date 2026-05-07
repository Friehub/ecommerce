'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MapPin, 
  Plus, 
  ChevronLeft,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  Home,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: addresses, isLoading } = api.iam.getAddresses.useQuery(undefined, {
    enabled: !!session
  });
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const utils = api.useUtils();
  const deleteMutation = api.iam.deleteAddress.useMutation({
    onSuccess: () => {
      utils.iam.getAddresses.invalidate();
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <div className="bg-[#F9F9FA] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F68B1E] font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Account
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Address Management</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your delivery and billing addresses.</p>
          </div>
          <button 
            onClick={() => alert('Add address functionality coming soon!')}
            className="bg-[#F68B1E] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-[#E07A1A] active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses && addresses.length > 0 ? (
            addresses.map((address: any) => (
              <div 
                key={address.id}
                className={`bg-white rounded-2xl border p-6 relative transition-all shadow-sm ${
                  address.isDefault ? 'border-[#F68B1E] ring-1 ring-[#F68B1E]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[#F68B1E] text-[10px] font-black uppercase tracking-[0.1em] bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                    <CheckCircle2 size={12} /> Default
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center border border-gray-100">
                    {address.addressType === 'HOME' ? <Home size={20} /> : <Briefcase size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-gray-900 uppercase tracking-tight">{address.addressType}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{address.firstName} {address.lastName}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-sm font-medium text-gray-600 line-clamp-1">{address.streetAddress}</p>
                  {address.landmark && <p className="text-xs text-gray-400 italic">Near {address.landmark}</p>}
                  <p className="text-sm font-medium text-gray-600">{address.city}, {address.state}</p>
                  <p className="text-sm font-black text-gray-900 pt-2 tracking-tight">{address.phone}</p>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                  <button 
                    disabled={deleteMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    disabled={deleteMutation.isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {deleteMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">No addresses yet</h2>
              <p className="text-sm text-gray-400 font-medium mt-1 mb-6">Save your delivery address for a faster checkout.</p>
              <button className="text-[#F68B1E] font-black text-xs uppercase tracking-widest hover:underline">
                Add your first address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

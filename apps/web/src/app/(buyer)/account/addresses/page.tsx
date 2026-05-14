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
  Briefcase,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useToast } from '@/hooks/useToast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Shared AddAddressForm logic
function AddAddressModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const { toast } = useToast();
  const createAddress = api.iam.addAddress.useMutation({
    onSuccess: () => {
      toast({ title: 'Address Added', message: 'Your address has been added successfully.', type: 'success' });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast({ title: 'Error', message: err.message, type: 'error' });
    }
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    addressType: 'HOME' as 'HOME' | 'OFFICE',
    isDefault: false
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-sm border border-j-border shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-j-border flex items-center justify-between bg-j-surface-container-low">
          <div>
            <h2 className="text-xl font-black text-j-text uppercase tracking-tight">Add New Address</h2>
            <p className="text-[10px] font-bold text-j-text-muted uppercase mt-1">Enter your shipping details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-j-border rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); createAddress.mutate(formData); }} className="p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name"
              required 
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
              placeholder="John"
            />
            <Input 
              label="Last Name"
              required 
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
              placeholder="Doe"
            />
          </div>

          <Input 
            label="Phone Number"
            required 
            type="tel"
            placeholder="08012345678"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />

          <Input 
            label="Street Address"
            required 
            value={formData.streetAddress}
            onChange={e => setFormData({...formData, streetAddress: e.target.value})}
            placeholder="No. 123 Jumia Street"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="City"
              required 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              placeholder="Lagos"
            />
            <Input 
              label="State"
              required 
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              placeholder="Lagos"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-j-text-muted ml-1">Address Type</label>
            <div className="flex gap-4">
              {(['HOME', 'OFFICE'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, addressType: type})}
                  className={`flex-1 h-12 rounded-sm text-xs font-black uppercase tracking-wider transition-all border ${
                    formData.addressType === type 
                      ? 'bg-jumia-orange text-white border-jumia-orange' 
                      : 'bg-white text-j-text-muted border-j-border hover:bg-j-surface-container-low'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit"
              isLoading={createAddress.isLoading}
              className="w-full h-14 font-black uppercase"
            >
              Save Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { data: addresses, isLoading } = api.iam.getAddresses.useQuery(undefined, {
    enabled: !!session
  });
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-j-background gap-4">
        <div className="w-12 h-12 border-4 border-j-border border-t-jumia-orange rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase text-j-text-muted">Loading addresses...</p>
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
      toast({ title: 'Address Deleted', message: 'Address has been successfully removed.', type: 'success' });
      utils.iam.getAddresses.invalidate();
      setIsDeleteModalOpen(false);
    },
    onError: (err) => {
      toast({ title: 'Error', message: err.message, type: 'error' });
    }
  });

  const handleDelete = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-j-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-j-text-muted hover:text-j-text mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase">Back</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight">Address <span className="text-jumia-orange">Book</span></h1>
            <p className="text-[10px] text-j-text-muted font-bold mt-2 uppercase tracking-wide">Manage your shipping addresses</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-14 px-8 font-black uppercase"
          >
            <Plus size={18} className="mr-2" /> Add New Address
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses && addresses.length > 0 ? (
            addresses.map((address: any) => (
              <div 
                key={address.id}
                className={`bg-white rounded-sm border p-6 relative transition-all shadow-sm ${
                  address.isDefault ? 'border-jumia-orange' : 'border-j-border hover:border-jumia-orange/30'
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-jumia-orange text-[9px] font-black uppercase bg-orange-50 px-3 py-1.5 rounded-sm border border-jumia-orange/20">
                    <CheckCircle2 size={12} /> Default
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-j-surface-container-low text-j-text rounded-sm flex items-center justify-center border border-j-border">
                    {address.addressType === 'HOME' ? <Home size={20} /> : <Briefcase size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-j-text uppercase tracking-wider">{address.addressType}</h3>
                    <p className="text-[10px] font-bold text-j-text-muted uppercase mt-1">{address.firstName} {address.lastName}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-6 min-h-[80px]">
                  <p className="text-xs font-bold text-j-text uppercase tracking-tight leading-relaxed line-clamp-2">{address.streetAddress}</p>
                  {address.landmark && <p className="text-[10px] text-jumia-orange font-bold uppercase tracking-wider">Near {address.landmark}</p>}
                  <p className="text-[10px] font-bold text-j-text-muted uppercase">{address.city}, {address.state}</p>
                  <p className="text-sm font-black text-j-text pt-4">{address.phone}</p>
                </div>

                <div className="flex items-center gap-4 border-t border-j-border pt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-wider text-j-text-muted hover:text-j-text transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-wider text-j-error hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-sm border border-dashed border-j-border p-16 text-center">
              <div className="w-20 h-20 bg-j-surface-container-low text-j-text-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} />
              </div>
              <h2 className="text-xl font-black text-j-text uppercase tracking-tight">No Addresses Found</h2>
              <p className="text-xs font-bold text-j-text-muted mt-2 mb-8 uppercase max-w-[280px] mx-auto">
                Add a shipping address to speed up your checkout process.
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                variant="outline"
                className="font-black"
              >
                Add Address
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddAddressModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => utils.iam.getAddresses.invalidate()} 
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={() => addressToDelete && deleteMutation.mutate({ id: addressToDelete })}
        title="Delete Address?"
        message="Are you sure you want to delete this shipping address?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

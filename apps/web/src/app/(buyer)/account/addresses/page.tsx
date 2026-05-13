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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useToast } from '@/hooks/useToast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// Shared AddAddressForm logic (simplified for standalone use)
function AddAddressModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
 const { toast } = useToast();
 const createAddress = api.iam.addAddress.useMutation({
 onSuccess: () => {
 toast({ title: 'Location Verified', message: 'Primary distribution node added to your profile.', type: 'success' });
 onSuccess();
 onClose();
 },
 onError: (err) => {
 toast({ title: 'Linkage Failed', message: err.message, type: 'error' });
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
 <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-md" onClick={onClose} />
 <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
 <div className="p-8 md:p-12 border-b-2 border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
 <div>
 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter">Register Node</h2>
 <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40 mt-1 italic">Adding new logistics endpoint</p>
 </div>
 <button onClick={onClose} className="w-12 h-12 bg-surface-container-low rounded-2xl flex items-center justify-center hover:bg-error/10 hover:text-error transition-all">
 <X size={20} />
 </button>
 </div>

 <form onSubmit={(e) => { e.preventDefault(); createAddress.mutate(formData); }} className="p-8 md:p-12 space-y-8">
 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Codename (First)</label>
 <input 
 required 
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black uppercase tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.firstName}
 onChange={e => setFormData({...formData, firstName: e.target.value})}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Surname</label>
 <input 
 required 
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black uppercase tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.lastName}
 onChange={e => setFormData({...formData, lastName: e.target.value})}
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Communication Line</label>
 <input 
 required 
 type="tel"
 placeholder="+234..."
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.phone}
 onChange={e => setFormData({...formData, phone: e.target.value})}
 />
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Street Protocol</label>
 <input 
 required 
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black uppercase tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.streetAddress}
 onChange={e => setFormData({...formData, streetAddress: e.target.value})}
 />
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Sector (City)</label>
 <input 
 required 
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black uppercase tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.city}
 onChange={e => setFormData({...formData, city: e.target.value})}
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">Territory (State)</label>
 <input 
 required 
 className="w-full h-16 bg-surface-container-low border-2 border-outline-variant/30 rounded-[24px] px-6 text-sm font-black uppercase tracking-tight focus:border-primary-container/40 focus:ring-0 transition-all" 
 value={formData.state}
 onChange={e => setFormData({...formData, state: e.target.value})}
 />
 </div>
 </div>

 <div className="flex gap-4">
 {(['HOME', 'OFFICE'] as const).map(type => (
 <button
 key={type}
 type="button"
 onClick={() => setFormData({...formData, addressType: type})}
 className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
 formData.addressType === type 
 ? 'bg-primary-container text-white border-primary-container' 
 : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30'
 }`}
 >
 {type}
 </button>
 ))}
 </div>

 <button 
 type="submit"
 disabled={createAddress.isLoading}
 className="w-full h-16 bg-on-surface text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50"
 >
 {createAddress.isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Registration'}
 </button>
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
 <div className="min-h-screen flex items-center justify-center bg-background">
 <Loader2 className="animate-spin text-primary-container" size={40} />
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
 toast({ title: 'Node Decommissioned', message: 'Address has been successfully removed.', type: 'success' });
 utils.iam.getAddresses.invalidate();
 setIsDeleteModalOpen(false);
 },
 onError: (err) => {
 toast({ title: 'Removal Failed', message: err.message, type: 'error' });
 }
 });

 const handleDelete = (id: string) => {
 setAddressToDelete(id);
 setIsDeleteModalOpen(true);
 };

 return (
 <div className="bg-background min-h-screen py-12">
 <div className="container mx-auto px-4 max-w-4xl">
 <Link 
 href="/account" 
 className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary-container font-black text-[10px] uppercase tracking-[0.2em] mb-10 transition-all group"
 >
 <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
 </Link>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
 <div>
 <h1 className="text-3xl md:text-4xl font-black text-on-surface uppercase tracking-tighter leading-none">Logistic Matrix</h1>
 <p className="text-[10px] text-on-surface-variant font-black mt-3 uppercase tracking-[0.4em] opacity-40 italic">Managing primary and secondary distribution nodes</p>
 </div>
 <button 
 onClick={() => setIsAddModalOpen(true)}
 className="bg-primary-container text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary-container/20 hover:shadow-2xl transition-all active:scale-95 flex items-center gap-3 group"
 >
 <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add New Node
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {addresses && addresses.length > 0 ? (
 addresses.map((address: any) => (
 <div 
 key={address.id}
 className={`bg-surface-container-lowest rounded-[40px] border-4 p-8 relative transition-all shadow-soft group ${
 address.isDefault ? 'border-primary-container shadow-2xl shadow-primary-container/10' : 'border-surface-container-low hover:border-primary-container/20'
 }`}
 >
 {address.isDefault && (
 <div className="absolute top-6 right-6 flex items-center gap-2 text-primary-container text-[8px] font-black uppercase tracking-[0.2em] bg-primary-container/5 px-3 py-1.5 rounded-xl border border-primary-container/20 italic">
 <CheckCircle2 size={12} /> Primary
 </div>
 )}
 
 <div className="flex items-center gap-4 mb-8">
 <div className="w-14 h-14 bg-surface-container-low text-primary-container rounded-[20px] flex items-center justify-center border-2 border-outline-variant/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
 {address.addressType === 'HOME' ? <Home size={24} /> : <Briefcase size={24} />}
 </div>
 <div>
 <h3 className="font-black text-xs text-on-surface uppercase tracking-widest">{address.addressType}</h3>
 <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1 opacity-40">{address.firstName} {address.lastName}</p>
 </div>
 </div>

 <div className="space-y-2 mb-8 h-24">
 <p className="text-xs font-bold text-on-surface-variant uppercase tracking-tight leading-relaxed">{address.streetAddress}</p>
 {address.landmark && <p className="text-[9px] text-primary-container font-black uppercase tracking-widest opacity-60 italic">Near {address.landmark}</p>}
 <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">{address.city}, {address.state}</p>
 <p className="text-sm font-black text-on-surface pt-4 tracking-tighter">{address.phone}</p>
 </div>

 <div className="flex items-center gap-4 border-t-2 border-outline-variant/30 pt-6">
 <button 
 className="flex-1 flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-2xl transition-all border-2 border-transparent"
 >
 <Edit2 size={14} /> Update
 </button>
 <button 
 onClick={() => handleDelete(address.id)}
 className="flex-1 flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase tracking-widest text-error hover:bg-error/10 rounded-2xl transition-all border-2 border-error/5"
 >
 <Trash2 size={14} /> Remove
 </button>
 </div>
 </div>
 ))
 ) : (
 <div className="col-span-full bg-surface-container-low/30 rounded-[48px] border-4 border-dashed border-outline-variant/30 p-20 text-center animate-in fade-in zoom-in-95 duration-700">
 <div className="w-24 h-24 bg-surface-container-low text-primary-container/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-4 border-outline-variant/10 shadow-inner">
 <MapPin size={40} />
 </div>
 <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter">Zero Nodes Detected</h2>
 <p className="text-[10px] text-on-surface-variant font-black mt-3 mb-10 uppercase tracking-[0.3em] opacity-40 italic">Initialize your distribution matrix to accelerate checkout</p>
 <button 
 onClick={() => setIsAddModalOpen(true)}
 className="text-primary-container font-black text-xs uppercase tracking-[0.4em] hover:underline"
 >
 Begin Initialization
 </button>
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
 onClose={() => setIsDeleteModalOpen(false)}
 onConfirm={() => addressToDelete && deleteMutation.mutate({ id: addressToDelete })}
 title="Decommission Node?"
 message="Are you certain you want to remove this logistics endpoint? This action is irreversible."
 confirmLabel="Confirm Removal"
 type="danger"
 />
 </div>
 );
}

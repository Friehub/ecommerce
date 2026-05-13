'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
 User, 
 Lock, 
 ShieldCheck, 
 Bell, 
 ChevronLeft,
 Loader2,
 Save,
 AlertCircle,
 Eye,
 Settings,
 Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';

export default function SettingsPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
 
 const { data: user, isLoading: userLoading } = api.iam.me.useQuery();
 const utils = api.useUtils();
 
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [phone, setPhone] = useState('');
 
 React.useEffect(() => {
 if (user) {
 setFirstName(user.firstName || '');
 setLastName(user.lastName || '');
 setPhone(user.phone || '');
 }
 }, [user]);

 const updateProfile = api.iam.updateProfile.useMutation({
 onSuccess: () => {
 utils.iam.me.invalidate();
 },
 onError: (err) => {
 console.error(err);
 }
 });

  const toggleTwoFactor = api.iam.toggleTwoFactor.useMutation({
    onSuccess: () => {
      utils.iam.me.invalidate();
    }
  });

 const handleSave = (e: React.FormEvent) => {
 e.preventDefault();
 updateProfile.mutate({
 firstName,
 lastName,
 phone
 });
 };
 
 if (status === 'loading' || userLoading) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40">Decrypting Profile Matrix</p>
 </div>
 );
 }

 if (!session) {
 router.push('/login');
 return null;
 }

 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-6xl">
 <button 
 onClick={() => router.back()}
 className="inline-flex items-center gap-3 text-on-surface-variant hover:text-on-surface mb-12 transition-all group"
 >
 <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Control Center</span>
 </button>

 <div className="flex flex-col lg:flex-row gap-12">
 {/* Sidebar Tabs */}
 <div className="w-full lg:w-80 shrink-0">
 <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft overflow-hidden animate-in fade-in slide-in-from-left-8 duration-700">
 <div className="p-8 border-b-2 border-surface-container-low bg-surface-container-low/30">
 <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em]">Access Permissions</h3>
 </div>
 <div className="p-4 space-y-2">
 {[
 { id: 'profile', label: 'Identity Protocol', icon: <User size={18} /> },
 { id: 'security', label: 'Security Handshake', icon: <Fingerprint size={18} /> },
 ].map((tab) => (
 <button 
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] text-[10px] uppercase tracking-widest font-black transition-all group ${
 activeTab === tab.id 
 ? 'bg-primary-container text-white shadow-xl shadow-primary-container/20 translate-x-2' 
 : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-low'
 }`}
 >
 <div className={`p-2 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/20' : 'bg-surface-container-low group-hover:bg-surface-container'}`}>
 {tab.icon}
 </div>
 {tab.label}
 </button>
 ))}
 </div>
 <div className="p-8 bg-surface-container-low/30 border-t-2 border-surface-container-low">
 <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.4em] mb-3 italic">Authorized Signature</p>
 <div className="bg-background/50 p-4 rounded-2xl border-2 border-surface-container-low overflow-hidden">
 <code className="text-[10px] text-primary-container font-mono break-all opacity-60">USR-{session.user?.id?.substring(0, 16).toUpperCase()}...</code>
 </div>
 </div>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="flex-1">
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-10 lg:p-14 animate-in fade-in slide-in-from-right-8 duration-1000">
 {activeTab === 'profile' ? (
 <div>
 <div className="flex items-center gap-4 mb-10 pb-8 border-b-2 border-surface-container-low">
 <div className="w-16 h-16 bg-primary-container/10 border-2 border-primary-container/20 rounded-[20px] flex items-center justify-center text-primary-container shadow-xl shadow-primary-container/5">
 <Settings size={32} />
 </div>
 <div>
 <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">Identity <span className="text-primary-container">Sync</span></h2>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Entity Metadata Revision v1.0.4</p>
 </div>
 </div>
 
 <form onSubmit={handleSave} className="space-y-10">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 italic">Legal Given Name</label>
 <input 
 type="text" 
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 className="w-full h-16 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-on-surface focus:border-primary-container transition-all outline-none"
 />
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 italic">Legal Surname</label>
 <input 
 type="text" 
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 className="w-full h-16 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-on-surface focus:border-primary-container transition-all outline-none"
 />
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 italic">Communication Frequency (Phone)</label>
 <input 
 type="tel" 
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="w-full h-16 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-on-surface focus:border-primary-container transition-all outline-none"
 />
 </div>
 <div className="space-y-3">
 <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 italic">Primary Identity (Email)</label>
 <div className="w-full h-16 bg-surface-container-low/10 border-2 border-surface-container-low/50 rounded-2xl px-6 flex items-center text-sm font-black uppercase tracking-widest text-on-surface-variant/30 cursor-not-allowed">
 {session.user?.email || ''}
 </div>
 </div>
 </div>

 <div className="pt-10 border-t-2 border-surface-container-low">
 <button 
 type="submit"
 disabled={updateProfile.isLoading}
 className="h-20 px-12 bg-on-surface text-white rounded-[24px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-container transition-all transform active:scale-95 flex items-center gap-4 disabled:opacity-30 group"
 >
 {updateProfile.isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
 Sync Identity Matrix
 </button>
 </div>
 </form>
 </div>
 ) : (
 <div>
 <div className="flex items-center gap-4 mb-10 pb-8 border-b-2 border-surface-container-low">
 <div className="w-16 h-16 bg-error/10 border-2 border-error/20 rounded-[20px] flex items-center justify-center text-error shadow-xl shadow-error/5">
 <Lock size={32} />
 </div>
 <div>
 <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">Security <span className="text-error">Handshake</span></h2>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Access Control & Encryption Protocol</p>
 </div>
 </div>
 
 <div className="space-y-6">
 <div className="p-8 bg-surface-container-low/30 rounded-[32px] border-2 border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-primary-container transition-all group">
 <div className="flex items-center gap-6">
 <div className="w-16 h-16 bg-surface-container-lowest border-2 border-surface-container-low rounded-2xl flex items-center justify-center text-primary-container shadow-soft group-hover:scale-110 transition-transform">
 <Eye size={24} />
 </div>
 <div>
 <p className="font-black text-sm text-on-surface uppercase tracking-tight">Credential Update</p>
 <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-1 italic">Last sync: 14 days ago</p>
 </div>
 </div>
 <button className="h-14 px-10 bg-on-surface text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary-container transition-all active:scale-95">
 Initiate Reset
 </button>
 </div>

  <div className={`p-8 rounded-[32px] border-2 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all group ${
    (user as any)?.twoFactorEnabled 
      ? 'bg-primary-container/5 border-primary-container/30' 
      : 'bg-surface-container-low/30 border-surface-container-low'
  }`}>
    <div className="flex items-center gap-6">
      <div className={`w-16 h-16 bg-surface-container-lowest border-2 rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform ${
        (user as any)?.twoFactorEnabled ? 'border-primary-container text-primary-container' : 'border-surface-container-low text-on-surface-variant/40'
      }`}>
        <ShieldCheck size={24} />
      </div>
      <div>
        <p className="font-black text-sm text-on-surface uppercase tracking-tight">Two-Factor Encryption</p>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic ${
          (user as any)?.twoFactorEnabled ? 'text-primary-container' : 'text-error'
        }`}>
          Status: {(user as any)?.twoFactorEnabled ? 'Protected' : 'Defunct'}
        </p>
      </div>
    </div>
    <button 
      onClick={() => {
        const enabled = !(user as any)?.twoFactorEnabled;
        toggleTwoFactor.mutate({ enabled });
      }}
      disabled={toggleTwoFactor.isLoading}
      className={`h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-3 ${
        (user as any)?.twoFactorEnabled 
          ? 'bg-error/10 text-error hover:bg-error/20 border-2 border-error/20' 
          : 'bg-on-surface text-white hover:bg-primary-container'
      }`}
    >
      {toggleTwoFactor.isLoading && <Loader2 size={14} className="animate-spin" />}
      {(user as any)?.twoFactorEnabled ? 'Deactivate Node' : 'Activate Protocol'}
    </button>
  </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

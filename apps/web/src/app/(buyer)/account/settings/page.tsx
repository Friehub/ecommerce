'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
 User, 
 Lock, 
 ShieldCheck, 
 ChevronLeft,
 Settings,
 Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-j-background gap-4">
        <div className="w-12 h-12 border-4 border-j-border border-t-jumia-orange rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase text-j-text-muted">Loading settings...</p>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="container py-8 max-w-6xl mx-auto px-4">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-j-text-muted hover:text-j-text mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase">Back</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-j-border bg-j-surface-container-low">
                <h3 className="text-xs font-black text-j-text uppercase tracking-wider">Account Settings</h3>
              </div>
              <div className="p-2 space-y-1">
                {[
                  { id: 'profile', label: 'Personal Details', icon: <User size={18} /> },
                  { id: 'security', label: 'Security', icon: <Fingerprint size={18} /> },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-sm text-xs uppercase font-black transition-all group ${
                      activeTab === tab.id 
                        ? 'bg-jumia-orange text-white' 
                        : 'text-j-text-muted hover:text-j-text hover:bg-j-surface-container-low'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-6 bg-j-surface-container-low border-t border-j-border">
                <p className="text-[10px] font-bold text-j-text-muted uppercase mb-2">Account ID</p>
                <div className="bg-white p-3 rounded-sm border border-j-border">
                  <code className="text-[10px] text-jumia-orange font-mono break-all font-bold">
                    {session.user?.id?.substring(0, 16).toUpperCase()}...
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-sm border border-j-border shadow-sm p-8 lg:p-10">
              {activeTab === 'profile' ? (
                <div>
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-j-border">
                    <div className="w-12 h-12 bg-jumia-orange/10 rounded flex items-center justify-center text-jumia-orange">
                      <Settings size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-j-text uppercase tracking-tight">Personal <span className="text-jumia-orange">Details</span></h2>
                      <p className="text-[10px] font-bold text-j-text-muted uppercase mt-1">Manage your account information</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="First Name"
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                      />
                      <Input 
                        label="Last Name"
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                      />
                      <Input 
                        label="Phone Number"
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08012345678"
                        required
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-j-text-muted ml-1">Email Address</label>
                        <div className="w-full h-12 bg-j-surface-container-low border border-j-border rounded-sm px-4 flex items-center text-sm font-bold text-j-text-muted opacity-60 cursor-not-allowed">
                          {session.user?.email || ''}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-j-border">
                      <Button 
                        type="submit"
                        isLoading={updateProfile.isLoading}
                        className="h-12 px-8 font-black"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-j-border">
                    <div className="w-12 h-12 bg-j-text text-white rounded flex items-center justify-center">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-j-text uppercase tracking-tight">Security <span className="text-jumia-orange">Settings</span></h2>
                      <p className="text-[10px] font-bold text-j-text-muted uppercase mt-1">Protect your account access</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-j-surface-container-low rounded-sm border border-j-border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-jumia-orange transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white border border-j-border rounded flex items-center justify-center text-jumia-orange shadow-sm">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-j-text uppercase">Password</p>
                          <p className="text-[10px] text-j-text-muted font-bold uppercase mt-1">Change your current password</p>
                        </div>
                      </div>
                      <Link href="/auth/reset-password">
                        <Button variant="outline" className="h-10 px-6 text-[10px] font-black">
                          Change
                        </Button>
                      </Link>
                    </div>

                    <div className={`p-6 rounded-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
                      (user as any)?.twoFactorEnabled 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-j-surface-container-low border-j-border'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-white border rounded flex items-center justify-center shadow-sm ${
                          (user as any)?.twoFactorEnabled ? 'border-green-400 text-green-600' : 'border-j-border text-j-text-muted'
                        }`}>
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-j-text uppercase">Two-Step Verification</p>
                          <p className={`text-[10px] font-black uppercase mt-1 ${
                            (user as any)?.twoFactorEnabled ? 'text-green-600' : 'text-j-error'
                          }`}>
                            Status: {(user as any)?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          const enabled = !(user as any)?.twoFactorEnabled;
                          toggleTwoFactor.mutate({ enabled });
                        }}
                        isLoading={toggleTwoFactor.isLoading}
                        variant={(user as any)?.twoFactorEnabled ? "outline" : "primary"}
                        className={`h-10 px-6 text-[10px] font-black uppercase ${
                          (user as any)?.twoFactorEnabled ? 'border-j-error text-j-error hover:bg-red-50 hover:border-j-error' : ''
                        }`}
                      >
                        {(user as any)?.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
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

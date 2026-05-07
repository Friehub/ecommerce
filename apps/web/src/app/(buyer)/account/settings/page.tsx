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
  AlertCircle
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
  
  // Form states
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
      alert('Profile updated successfully!');
      utils.iam.me.invalidate();
    },
    onError: (err) => {
      alert(err.message || 'Failed to update profile');
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
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FA]">
        <Loader2 className="animate-spin text-[#F68B1E]" size={40} />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="bg-[#F9F9FA] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#F68B1E] font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Account
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-[10px] uppercase tracking-widest font-black transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-orange-50 text-[#F68B1E] border-l-4 border-[#F68B1E]' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <User size={18} /> Personal Info
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-6 py-4 text-[10px] uppercase tracking-widest font-black transition-all ${
                  activeTab === 'security' 
                    ? 'bg-orange-50 text-[#F68B1E] border-l-4 border-[#F68B1E]' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck size={18} /> Security
              </button>
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Account ID</p>
                <code className="text-[10px] text-gray-300 break-all">{session.user?.id || '—'}</code>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
              {activeTab === 'profile' ? (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Personal Information</h2>
                  <p className="text-sm text-gray-500 mb-8 font-medium">Update your profile details and how we can contact you.</p>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234..."
                          className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                        <input 
                          type="email" 
                          value={session.user?.email || ''}
                          disabled
                          className="w-full h-12 bg-gray-100 border border-gray-100 rounded-xl px-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        disabled={updateProfile.isLoading}
                        className="bg-[#F68B1E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:bg-[#E07A1A] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                      >
                        {updateProfile.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Security Settings</h2>
                  <p className="text-sm text-gray-500 mb-8 font-medium">Manage your password and account security.</p>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#F68B1E] shadow-sm">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 uppercase tracking-tight">Account Password</p>
                          <p className="text-xs text-gray-400 font-medium italic">Last changed: Never</p>
                        </div>
                      </div>
                      <button className="bg-white border border-gray-200 text-gray-900 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-[#F68B1E] hover:text-[#F68B1E] transition-all">
                        Update
                      </button>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between opacity-50 select-none">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 uppercase tracking-tight">Two-Factor Auth</p>
                          <p className="text-xs text-red-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                            Disabled
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Coming Soon</span>
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

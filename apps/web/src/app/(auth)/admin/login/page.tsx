'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminMFALoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && email && password) {
      setStep(2);
    }
  };

  const handleFinalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Unauthorized administrative access');
        setStep(1);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('A secure communication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FA] flex flex-col justify-center items-center py-12 px-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden duration-300 transition-all hover:shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-[#F68B1E] animate-pulse">
              <ShieldCheck size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Admin Secure Access</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1.5 bg-gray-50/80 px-3 py-1 rounded w-fit mx-auto border border-gray-100">
              Multi-Factor Authentication Required
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black border border-red-100 mb-6 uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-gray-400" /> Administrative Email
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecom.dev"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#F68B1E] focus:bg-white transition-all shadow-sm duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1">
                  <Key size={12} className="text-gray-400" /> Admin Password
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#F68B1E] focus:bg-white transition-all shadow-sm duration-200"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:shadow-lg active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 border border-transparent shadow-md mt-6 select-none cursor-pointer"
              >
                PROCEED <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider">
                  MFA Code (Authenticator / SMS)
                </label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-center text-lg font-black tracking-widest text-gray-900 focus:outline-none focus:border-[#F68B1E] focus:bg-white transition-all shadow-sm duration-200"
                />
                <p className="text-[10px] text-gray-400 font-medium text-center mt-2 leading-relaxed">
                  Please enter the 6-digit authentication token generated by your corporate mobile security app.
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:shadow-lg active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 border border-transparent shadow-md mt-6 select-none"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'AUTHORIZE LOGIN'}
              </button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-gray-400 font-bold hover:text-gray-600 transition-all uppercase tracking-wider cursor-pointer mt-2"
              >
                Go back to Step 1
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

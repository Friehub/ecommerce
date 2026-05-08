'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SellerLoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
        setError('Invalid seller credentials');
      } else {
        router.refresh();
        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get('callbackUrl');
        router.push(callbackUrl || '/seller/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex flex-col justify-center items-center py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#fff_0%,#f4f4f7_100%)] z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px] z-0" />

      <div className="w-full max-w-[460px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 relative z-10 overflow-hidden transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(246,139,30,0.15)]">
        <div className="bg-[#1A1A1A] p-10 text-center relative">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="relative z-10">
             <div className="w-20 h-20 bg-[#F68B1E] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40 rotate-6 hover:rotate-0 transition-transform duration-500">
               <ShoppingBag size={40} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Seller Center</h1>
             <div className="flex items-center justify-center gap-2">
               <div className="h-[1px] w-4 bg-orange-500/50" />
               <p className="text-orange-200/80 text-[10px] font-black uppercase tracking-[0.3em]">Global Marketplace</p>
               <div className="h-[1px] w-4 bg-orange-500/50" />
             </div>
           </div>
        </div>

        <div className="p-10 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-[10px] font-black border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                {error.toUpperCase()}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Credentials</label>
                <span className="text-[9px] font-bold text-orange-500/60 uppercase">Required</span>
              </div>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F68B1E] transition-colors" size={22} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 border-2 border-gray-100 bg-gray-50/50 focus:border-[#F68B1E] focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all duration-300 placeholder:text-gray-300 placeholder:font-medium"
                  placeholder="business@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Security</label>
                <Link href="#" className="text-[9px] font-bold text-gray-300 hover:text-[#F68B1E] uppercase transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F68B1E] transition-colors" size={22} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-16 pl-14 pr-6 border-2 border-gray-100 bg-gray-50/50 focus:border-[#F68B1E] focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all duration-300 placeholder:text-gray-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_20px_40px_-12px_rgba(246,139,30,0.4)] hover:translate-y-[-4px] active:translate-y-[1px] duration-300 transition-all flex items-center justify-center gap-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={28} /> : (
                <>
                  Access Terminal <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-gray-100 text-center space-y-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              New merchant? <Link href="/seller/register" className="text-[#F68B1E] hover:underline ml-1">Establish Store</Link>
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login" className="text-[10px] font-black text-gray-300 hover:text-[#F68B1E] uppercase tracking-widest transition-colors">
                Customer Port
              </Link>
              <div className="w-1 h-1 bg-gray-200 rounded-full" />
              <Link href="/support" className="text-[10px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

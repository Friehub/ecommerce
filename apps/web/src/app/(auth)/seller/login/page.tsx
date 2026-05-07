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
    <div className="min-h-screen bg-[#F9F9FA] flex flex-col justify-center items-center py-12 px-4 select-none">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden duration-300 transition-all hover:shadow-orange-100/50">
        <div className="bg-[#333] p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="relative z-10">
             <div className="w-16 h-16 bg-[#F68B1E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20 rotate-3">
               <ShoppingBag size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Seller Center</h1>
             <p className="text-orange-200 text-xs font-bold uppercase tracking-[0.2em] mt-2">Manage Your Store</p>
           </div>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-black border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                {error.toUpperCase()}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Business Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F68B1E] transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 border-2 border-gray-50 bg-gray-50/30 focus:border-[#F68B1E] focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all duration-300"
                  placeholder="seller@ecom.dev"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F68B1E] transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 border-2 border-gray-100 bg-gray-50/30 focus:border-[#F68B1E] focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:translate-y-[-2px] active:translate-y-[1px] duration-300 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-orange-500/10 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Enter Dashboard <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              New to Jumia? <Link href="/seller/register" className="text-[#F68B1E] hover:underline ml-1">Join as a Seller</Link>
            </p>
            <Link href="/login" className="block text-[10px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-widest transition-colors">
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

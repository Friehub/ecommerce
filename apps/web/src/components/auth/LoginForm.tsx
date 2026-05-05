'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const LoginForm = () => {
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
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg duration-300 transition-all w-full max-w-[400px] shadow-md select-none">
      <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
      <p className="text-gray-400 font-medium text-sm mb-6">Login to your Jumia account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-gray-400 tracking-wide">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              placeholder="example@mail.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-gray-400 tracking-wide">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#F68B1E] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium">
        <span className="text-gray-400">Don&apos;t have an account? </span>
        <Link href="/register" className="text-[#F68B1E] font-black hover:underline tracking-tight">Register</Link>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

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
        router.refresh();
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          // Fetch session to determine role-aware redirect
          const response = await fetch('/api/auth/session');
          const session = await response.json();
          const role = session?.user?.role;

          if (role === 'SELLER') {
            router.push('/seller/dashboard');
          } else if (role === 'ADMIN') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }
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
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
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
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" size="sm" className="text-[10px] font-black text-[#FF7A00] hover:underline uppercase tracking-widest">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
        </button>
      </form>

      <div className="relative my-6 select-none">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-100"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
          <span className="bg-white px-3 text-gray-300">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: callbackUrl || '/' })}
        className="w-full h-12 bg-white border border-gray-200 hover:border-gray-300 rounded-xl font-black text-[11px] uppercase tracking-wide text-gray-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="mt-6 text-center text-sm font-medium">
        <span className="text-gray-400">Don&apos;t have an account? </span>
        <Link href="/register" className="text-[#FF7A00] font-black hover:underline tracking-tight">Register</Link>
      </div>
    </div>
  );
};

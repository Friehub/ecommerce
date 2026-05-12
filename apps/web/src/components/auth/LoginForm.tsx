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
    <div className="bg-surface-container-lowest p-10 rounded-[32px] border-4 border-surface-container-low hover:border-primary-container/20 hover:shadow-2xl duration-500 transition-all w-full max-w-[440px] shadow-soft select-none animate-in fade-in zoom-in-95">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center border-2 border-primary-container/10 mb-6 group">
          <Lock size={32} className="text-primary-container group-hover:rotate-12 transition-transform" />
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase leading-none mb-2">Access Granted</h1>
        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.4em] opacity-40">Secure Identity Gateway</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-error-container/10 text-error p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-error/10 animate-in fade-in duration-300">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Credential Identifier</label>
          <div className="relative group/input">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary-container transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-14 pr-6 border-2 border-surface-container-low focus:border-primary-container focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:opacity-30"
              placeholder="IDENTITY@NODE.COM"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Access Cipher</label>
          <div className="relative group/input">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-primary-container transition-colors" size={18} strokeWidth={1.5} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-14 pr-6 border-2 border-surface-container-low focus:border-primary-container focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:opacity-30"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex justify-end px-2">
          <Link href="/auth/forgot-password" size="sm" className="text-[9px] font-black text-on-surface-variant hover:text-primary-container hover:underline uppercase tracking-[0.3em] opacity-60">
            Recovery Protocol
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-on-surface text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl hover:scale-[1.02] active:scale-95 duration-300 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Verify Identity
              <Lock size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-10 select-none">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-surface-container-low"></span>
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
          <span className="bg-surface-container-lowest px-4 text-on-surface-variant opacity-30">External Linkage</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: callbackUrl || '/' })}
        className="w-full h-14 bg-surface-container-lowest border-2 border-surface-container-low hover:border-primary-container/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-on-surface transition-all duration-300 flex items-center justify-center gap-4 shadow-sm hover:shadow-xl active:scale-95 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        Federated Auth
      </button>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">
          New to the ecosystem?{' '}
          <Link href="/register" className="text-primary-container hover:underline ml-2">
            Initialize Account
          </Link>
        </p>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const requestReset = api.iam.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setLoading(false);
    },
    onError: (err) => {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    requestReset.mutate({ email });
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-md w-full max-w-[400px] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Check Your Email</h1>
        <p className="text-gray-400 font-medium text-sm mb-6">
          If an account exists for {email}, you will receive a password reset link shortly.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[#FF7A00] font-black uppercase text-xs tracking-widest hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg duration-300 transition-all w-full max-w-[400px] shadow-md select-none">
      <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Forgot Password?</h1>
      <p className="text-gray-400 font-medium text-sm mb-6">Enter your email to receive a reset link.</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-medium">
        <Link href="/login" className="text-gray-400 hover:text-gray-600 font-black flex items-center justify-center gap-2 tracking-tight">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

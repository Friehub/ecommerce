'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const ResetPasswordForm = () => {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const resetPassword = api.iam.resetPassword.useMutation({
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    setLoading(true);
    setError('');
    resetPassword.mutate({ token, newPassword: password });
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-md w-full max-w-[400px] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Password Reset!</h1>
        <p className="text-gray-400 font-medium text-sm mb-6">
          Your password has been successfully updated. You can now login with your new password.
        </p>
        <Link 
          href="/login" 
          className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          Login Now
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-md w-full max-w-[400px] text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Invalid Link</h1>
        <p className="text-gray-400 font-medium text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link 
          href="/auth/forgot-password" 
          className="text-[#FF7A00] font-black uppercase text-xs tracking-widest hover:underline"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg duration-300 transition-all w-full max-w-[400px] shadow-md select-none">
      <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">New Password</h1>
      <p className="text-gray-400 font-medium text-sm mb-6">Set a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-gray-400 tracking-wide">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-gray-400 tracking-wide">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-4 border border-gray-200 focus:border-[#FF7A00] focus:ring-1 focus:ring-orange-200/50 rounded-xl outline-none font-medium text-gray-800 bg-gray-50/20 focus:bg-white transition-all duration-200"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold uppercase tracking-wide hover:shadow-lg hover:scale-[1.02] active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

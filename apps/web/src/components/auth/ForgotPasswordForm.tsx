'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Mail, Loader2, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';
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
      <div className="bg-white p-10 md:p-12 rounded-sm border border-j-border shadow-xl w-full max-w-[480px] text-center animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-green-50 text-j-success rounded-full flex items-center justify-center border border-green-100">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-j-text mb-4 tracking-tight uppercase leading-none">Email <span className="text-j-success">Sent</span></h1>
        <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest mb-10 leading-relaxed opacity-60">
          We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-j-text hover:text-jumia-orange font-black uppercase text-[10px] tracking-widest transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-sm border border-j-border shadow-xl w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-sm flex items-center justify-center text-jumia-orange shadow-sm">
          <ShieldQuestion size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-j-text tracking-tight uppercase leading-none">Forgot <span className="text-jumia-orange">Password?</span></h1>
          <p className="text-[10px] font-black text-j-text-muted uppercase tracking-widest mt-1 opacity-60">Reset your account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-j-error p-4 rounded-sm text-[10px] font-black border border-red-100 uppercase tracking-widest text-center animate-in shake">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-j-text-muted tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted group-focus-within:text-jumia-orange transition-colors" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-12 pr-4 border border-j-border bg-j-background rounded-sm text-sm font-bold text-j-text placeholder:text-j-text-muted/40 focus:border-jumia-orange focus:bg-white transition-all outline-none"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-jumia-orange text-white rounded-sm font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Reset Password <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-j-border text-center">
        <Link href="/login" className="text-j-text-muted hover:text-jumia-orange font-black inline-flex items-center gap-2 text-[10px] uppercase tracking-widest transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform opacity-60" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

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
 <div className="bg-surface-container-lowest p-12 rounded border border-surface-container-low shadow-soft w-full max-w-[480px] text-center animate-in zoom-in-95 duration-500">
 <div className="flex justify-center mb-8">
 <div className="w-20 h-20 bg-success/10 text-success rounded flex items-center justify-center border-2 border-success/20">
 <CheckCircle2 size={40} />
 </div>
 </div>
 <h1 className="text-3xl font-semibold text-on-surface mb-4 tracking-tighter uppercase leading-none">Dispatch <span className="text-success">Sent</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mb-10 leading-relaxed italic">
 If an identity exists for {email.toUpperCase()}, a cryptographic reset link has been dispatched to that node.
 </p>
 <Link 
 href="/login" 
 className="inline-flex items-center gap-3 text-on-surface hover:text-jumia-orange font-semibold uppercase text-[10px] tracking-[0.3em] transition-colors group"
 >
 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
 Return to Hub
 </Link>
 </div>
 );
 }

 return (
 <div className="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] border border-surface-container-low shadow-soft w-full max-w-[520px] select-none animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-jumia-orange/10 border-2 border-jumia-orange/20 rounded-sm flex items-center justify-center text-jumia-orange shadow-xl shadow-primary-container/5">
 <ShieldQuestion size={32} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-on-surface tracking-tighter uppercase leading-none">Identity <span className="text-jumia-orange">Recovery</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Credentials Override Protocol</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-8">
 {error && (
 <div className="bg-error/5 text-error p-5 rounded-2xl text-[10px] font-semibold border-2 border-error/10 mb-8 uppercase tracking-[0.2em] text-center animate-in shake">
 {error}
 </div>
 )}

 <div className="space-y-3">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant/60 tracking-[0.2em] ml-2 italic">Registered Email Identity</label>
 <div className="relative group">
 <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-jumia-orange transition-colors" size={20} />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-16 pl-16 pr-6 border-2 border-surface-container-low bg-surface-container-low/30 rounded-2xl text-sm font-semibold uppercase tracking-widest text-on-surface focus:border-jumia-orange focus:bg-surface-container-lowest transition-all outline-none"
 placeholder="IDENTITY@DOMAIN.COM"
 required
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-20 bg-jumia-orange text-white rounded-3xl font-semibold text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-jumia-orange-dark transition-all active:scale-95 transform disabled:opacity-30 flex items-center justify-center gap-4 group"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : (
 <>
 Request Recovery <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 </form>

 <div className="mt-10 pt-10 border-t-2 border-surface-container-low text-center">
 <Link href="/login" className="text-on-surface-variant/40 hover:text-on-surface font-semibold inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] transition-all group italic">
 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform opacity-40" />
 Back to Hub Login
 </Link>
 </div>
 </div>
 );
};

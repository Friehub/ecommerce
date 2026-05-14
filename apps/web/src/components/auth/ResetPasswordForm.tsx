'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Lock, Loader2, CheckCircle2, ArrowRight, ShieldAlert, Fingerprint } from 'lucide-react';
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
 <div className="bg-surface-container-lowest p-12 rounded border border-surface-container-low shadow-soft w-full max-w-[480px] text-center animate-in zoom-in-95 duration-500">
 <div className="flex justify-center mb-8">
 <div className="w-20 h-20 bg-success/10 text-success rounded flex items-center justify-center border-2 border-success/20">
 <CheckCircle2 size={40} />
 </div>
 </div>
 <h1 className="text-3xl font-semibold text-on-surface mb-4 tracking-tighter uppercase leading-none">Access <span className="text-success">Restored</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mb-10 leading-relaxed italic">
 The cryptographic credentials for your identity node have been successfully synchronized.
 </p>
 <Link 
 href="/login" 
 className="w-full h-20 bg-jumia-orange text-white rounded-3xl font-semibold text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-jumia-orange-dark transition-all active:scale-95 flex items-center justify-center gap-4 group"
 >
 Proceed to Login
 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </Link>
 </div>
 );
 }

 if (!token) {
 return (
 <div className="bg-surface-container-lowest p-12 rounded border border-surface-container-low shadow-soft w-full max-w-[480px] text-center animate-in zoom-in-95 duration-500">
 <div className="flex justify-center mb-8">
 <div className="w-20 h-20 bg-error/10 text-error rounded flex items-center justify-center border-2 border-error/20">
 <ShieldAlert size={40} />
 </div>
 </div>
 <h1 className="text-3xl font-semibold text-on-surface mb-4 tracking-tighter uppercase leading-none">Link <span className="text-error">Defunct</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mb-10 leading-relaxed italic">
 The security token provided has expired or is cryptographically invalid for this node.
 </p>
 <Link 
 href="/auth/forgot-password" 
 className="inline-flex items-center gap-3 text-on-surface hover:text-jumia-orange font-semibold uppercase text-[10px] tracking-[0.3em] transition-colors group"
 >
 Request New Handshake
 </Link>
 </div>
 );
 }

 return (
 <div className="bg-surface-container-lowest p-10 md:p-14 rounded-[48px] border border-surface-container-low shadow-soft w-full max-w-[520px] select-none animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="flex items-center gap-5 mb-10">
 <div className="w-16 h-16 bg-jumia-orange/10 border-2 border-jumia-orange/20 rounded-sm flex items-center justify-center text-jumia-orange shadow-xl shadow-primary-container/5">
 <Fingerprint size={32} />
 </div>
 <div>
 <h1 className="text-3xl font-semibold text-on-surface tracking-tighter uppercase leading-none">Credential <span className="text-jumia-orange">Reset</span></h1>
 <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Override Security Protocols</p>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="bg-error/5 text-error p-5 rounded-2xl text-[10px] font-semibold border-2 border-error/10 mb-8 uppercase tracking-[0.2em] text-center animate-in shake">
 {error}
 </div>
 )}

 <div className="space-y-3">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant/60 tracking-[0.2em] ml-2 italic">New Access Cipher</label>
 <div className="relative group">
 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-jumia-orange transition-colors" size={20} />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full h-16 pl-16 pr-6 border-2 border-surface-container-low bg-surface-container-low/30 rounded-2xl text-sm font-semibold uppercase tracking-widest text-on-surface focus:border-jumia-orange focus:bg-surface-container-lowest transition-all outline-none"
 placeholder="••••••••••••"
 required
 minLength={8}
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant/60 tracking-[0.2em] ml-2 italic">Confirm Access Cipher</label>
 <div className="relative group">
 <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/20 group-focus-within:text-jumia-orange transition-colors" size={20} />
 <input
 type="password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full h-16 pl-16 pr-6 border-2 border-surface-container-low bg-surface-container-low/30 rounded-2xl text-sm font-semibold uppercase tracking-widest text-on-surface focus:border-jumia-orange focus:bg-surface-container-lowest transition-all outline-none"
 placeholder="••••••••••••"
 required
 minLength={8}
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-20 bg-jumia-orange text-white rounded-3xl font-semibold text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-jumia-orange-dark transition-all active:scale-95 transform mt-8 disabled:opacity-30 flex items-center justify-center gap-4 group"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : (
 <>
 Authorize Override <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </>
 )}
 </button>
 </form>
 </div>
 );
};

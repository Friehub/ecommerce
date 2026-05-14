'use client';

import React from 'react';
import { api } from '../../trpc/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, Phone, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const RegisterForm = () => {
 const [email, setEmail] = React.useState('');
 const [password, setPassword] = React.useState('');
 const [firstName, setFirstName] = React.useState('');
 const [lastName, setLastName] = React.useState('');
 const [phone, setPhone] = React.useState('');
 const [error, setError] = React.useState('');
 
 const router = useRouter();
 const register = api.iam.register.useMutation({
 onSuccess: () => {
 router.push('/login?registered=true');
 },
 onError: (err) => {
 setError(err.message || 'Registration failed');
 }
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 register.mutate({
 email,
 password,
 firstName,
 lastName,
 phone,
 });
 };

 return (
 <div className="bg-surface-container-lowest p-10 rounded border border-surface-container-low hover:border-jumia-orange/20 hover:shadow-2xl duration-500 transition-all w-full max-w-[500px] shadow-soft select-none animate-in fade-in zoom-in-95">
 <div className="flex flex-col items-center mb-10">
 <div className="w-16 h-16 bg-jumia-orange/10 rounded-2xl flex items-center justify-center border-2 border-jumia-orange/10 mb-6 group">
 <User size={32} className="text-jumia-orange group-hover:rotate-12 transition-transform" />
 </div>
 <h1 className="text-3xl font-semibold text-on-surface tracking-tighter uppercase leading-none mb-2">Create Account</h1>
 <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-[0.4em] opacity-40">Create your account</p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="bg-error-container/10 text-error p-4 rounded-2xl text-[10px] font-semibold uppercase tracking-[0.2em] border-2 border-error/10 animate-in fade-in duration-300">
 {error}
 </div>
 )}

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">First Name</label>
 <div className="relative group/input">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-jumia-orange transition-colors" size={16} strokeWidth={1.5} />
 <input
 type="text"
 value={firstName}
 onChange={(e) => setFirstName(e.target.value)}
 className="w-full h-14 pl-12 pr-4 border-2 border-surface-container-low focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="JOHN"
 required
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Last Name</label>
 <div className="relative group/input">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-jumia-orange transition-colors" size={16} strokeWidth={1.5} />
 <input
 type="text"
 value={lastName}
 onChange={(e) => setLastName(e.target.value)}
 className="w-full h-14 pl-12 pr-4 border-2 border-surface-container-low focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="DOE"
 required
 />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Email Identifier</label>
 <div className="relative group/input">
 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-jumia-orange transition-colors" size={18} strokeWidth={1.5} />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-14 pl-14 pr-6 border-2 border-surface-container-low focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="IDENTITY@NODE.COM"
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Communication Line</label>
 <div className="relative group/input">
 <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-jumia-orange transition-colors" size={18} strokeWidth={1.5} />
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 className="w-full h-14 pl-14 pr-6 border-2 border-surface-container-low focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="08012345678"
 required
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-[10px] font-semibold uppercase text-on-surface-variant tracking-[0.3em] ml-2 opacity-60">Secure Cipher</label>
 <div className="relative group/input">
 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within/input:text-jumia-orange transition-colors" size={18} strokeWidth={1.5} />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full h-14 pl-14 pr-6 border-2 border-surface-container-low focus:border-jumia-orange focus:ring-4 focus:ring-primary-container/5 rounded-2xl outline-none font-bold text-on-surface bg-surface-container-low/30 focus:bg-white transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="••••••••"
 required
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={register.isLoading}
 className="w-full h-16 bg-jumia-orange text-white rounded font-semibold uppercase tracking-[0.4em] text-[11px] hover:shadow-2xl hover:scale-[1.02] active:scale-95 duration-300 transition-all flex items-center justify-center gap-4 cursor-pointer disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed group shadow-xl shadow-on-surface/10"
 >
 {register.isLoading ? <Loader2 className="animate-spin" size={24} /> : (
 <>
 Initialize Account
 <Sparkles size={18} className="text-jumia-orange group-hover:scale-125 transition-transform" />
 </>
 )}
 </button>
 </form>

 <div className="mt-10 text-center">
 <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-on-surface-variant opacity-40">
 Already verified?{' '}
 <Link href="/login" className="text-jumia-orange hover:underline ml-2">
 Access Terminal
 </Link>
 </p>
 </div>
 </div>
 );
};

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
 <div className="min-h-screen bg-surface-container-lowest flex flex-col justify-center items-center py-20 px-4 relative overflow-hidden">
 {/* Decorative background elements */}
 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--surface)_0%,var(--surface-container-lowest)_100%)] z-0" />
 <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-jumia-orange/5 rounded-full blur-[120px] z-0" />
 <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary-container/5 rounded-full blur-[120px] z-0" />

 <div className="w-full max-w-[460px] bg-surface rounded shadow-soft border border-outline-variant/10 relative z-10 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-container/10">
 <div className="bg-jumia-orange p-10 text-center relative">
 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
 <div className="relative z-10">
 <div className="w-20 h-20 bg-jumia-orange rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-container/40 rotate-6 hover:rotate-0 transition-transform duration-500">
 <ShoppingBag size={40} className="text-white" />
 </div>
 <h1 className="text-3xl font-semibold text-white uppercase tracking-tight mb-2">Seller Center</h1>
 <div className="flex items-center justify-center gap-2">
 <div className="h-[1px] w-4 bg-jumia-orange/50" />
 <p className="text-primary-fixed-dim/80 text-[10px] font-semibold uppercase tracking-[0.3em]">Global Marketplace</p>
 <div className="h-[1px] w-4 bg-jumia-orange/50" />
 </div>
 </div>
 </div>

 <div className="p-10 md:p-12">
 <form onSubmit={handleSubmit} className="space-y-8">
 {error && (
 <div className="bg-error/10 text-error p-5 rounded-2xl text-[10px] font-semibold border border-error/20 flex items-center gap-3 animate-in fade-in zoom-in-95">
 <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
 {error.toUpperCase()}
 </div>
 )}

 <div className="space-y-3">
 <div className="flex justify-between items-center px-1">
 <label className="text-[11px] font-semibold uppercase text-on-surface-variant tracking-widest opacity-40">Credentials</label>
 <span className="text-[9px] font-bold text-jumia-orange/60 uppercase">Required</span>
 </div>
 <div className="relative group">
 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-jumia-orange transition-colors" size={22} />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-16 pl-14 pr-6 border-2 border-outline-variant/10 bg-surface-container-low/50 focus:border-jumia-orange focus:bg-white rounded-2xl outline-none font-bold text-on-surface transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="business@example.com"
 required
 />
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex justify-between items-center px-1">
 <label className="text-[11px] font-semibold uppercase text-on-surface-variant tracking-widest opacity-40">Security</label>
 <Link href="#" className="text-[9px] font-bold text-on-surface-variant/40 hover:text-jumia-orange uppercase transition-colors">Forgot?</Link>
 </div>
 <div className="relative group">
 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-jumia-orange transition-colors" size={22} />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full h-16 pl-14 pr-6 border-2 border-outline-variant/10 bg-surface-container-low/50 focus:border-jumia-orange focus:bg-white rounded-2xl outline-none font-bold text-on-surface transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 placeholder="••••••••"
 required
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-16 bg-jumia-orange text-white rounded-2xl font-semibold uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-[1px] duration-300 transition-all flex items-center justify-center gap-4 cursor-pointer disabled:opacity-50"
 >
 {loading ? <Loader2 className="animate-spin" size={28} /> : (
 <>
 Access Terminal <ArrowRight size={22} />
 </>
 )}
 </button>
 </form>

 <div className="mt-12 pt-10 border-t border-outline-variant/10 text-center space-y-6">
 <p className="text-[11px] font-bold text-on-surface-variant tracking-wide opacity-40 uppercase">
 New merchant? <Link href="/seller/register" className="text-jumia-orange hover:underline ml-1">Establish Store</Link>
 </p>
 <div className="flex items-center justify-center gap-4">
 <Link href="/login" className="text-[10px] font-semibold text-on-surface-variant/40 hover:text-jumia-orange uppercase tracking-widest transition-colors">
 Customer Port
 </Link>
 <div className="w-1 h-1 bg-outline-variant/30 rounded-full" />
 <Link href="/support" className="text-[10px] font-semibold text-on-surface-variant/40 hover:text-on-surface uppercase tracking-widest transition-colors">
 Support
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, Loader2, Fingerprint } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminMFALoginPage() {
 const [step, setStep] = useState(1);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [mfaCode, setMfaCode] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const router = useRouter();

 const handleNextStep = (e: React.FormEvent) => {
 e.preventDefault();
 if (step === 1 && email && password) {
 setStep(2);
 }
 };

 const handleFinalLogin = async (e: React.FormEvent) => {
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
 setError('Unauthorized administrative access');
 setStep(1);
 } else {
 router.push('/dashboard');
 router.refresh();
 }
 } catch (err) {
 setError('A secure communication error occurred');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 select-none relative overflow-hidden">
 {/* Decorative Elements */}
 <div className="absolute top-0 left-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
 <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

 <div className="w-full max-w-md bg-surface-container-lowest rounded-[40px] shadow-soft border-4 border-surface-container-low overflow-hidden duration-700 transition-all hover:shadow-2xl animate-in fade-in slide-in-from-bottom-8">
 <div className="p-10 md:p-14">
 <div className="flex justify-center mb-10">
 <div className="w-20 h-20 bg-primary-container/10 border-2 border-primary-container/20 rounded-[24px] flex items-center justify-center text-primary-container shadow-xl shadow-primary-container/5 animate-pulse">
 <Fingerprint size={40} />
 </div>
 </div>

 <div className="text-center mb-10">
 <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">Security <span className="text-primary-container">Vault</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-4 italic">Corporate Access Protocol Required</p>
 </div>

 {error && (
 <div className="bg-error/5 text-error p-5 rounded-2xl text-[10px] font-black border-2 border-error/10 mb-8 uppercase tracking-[0.2em] text-center animate-in shake duration-500">
 {error}
 </div>
 )}

 {step === 1 ? (
 <form onSubmit={handleNextStep} className="space-y-6">
 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-[0.2em] flex items-center gap-2 ml-2">
 <Lock size={14} className="opacity-40" /> Administrative Identity
 </label>
 <input 
 type="email" 
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="IDENTITY@ECOM.DEV"
 className="w-full h-16 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-on-surface focus:border-primary-container transition-all outline-none"
 />
 </div>

 <div className="space-y-3">
 <label className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-[0.2em] flex items-center gap-2 ml-2">
 <Key size={14} className="opacity-40" /> Access Credential
 </label>
 <input 
 type="password" 
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••••••"
 className="w-full h-16 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-on-surface focus:border-primary-container transition-all outline-none"
 />
 </div>

 <button 
 type="submit"
 className="w-full h-20 bg-on-surface text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-container transition-all active:scale-95 transform mt-8 flex items-center justify-center gap-4 group"
 >
 Proceed to MFA <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
 </button>
 </form>
 ) : (
 <form onSubmit={handleFinalLogin} className="space-y-8">
 <div className="space-y-4">
 <label className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-[0.2em] text-center block">
 Synchronize Security Token
 </label>
 <input 
 type="text" 
 required
 maxLength={6}
 value={mfaCode}
 onChange={(e) => setMfaCode(e.target.value)}
 placeholder="000 000"
 className="w-full h-20 bg-surface-container-low/30 border-2 border-surface-container-low rounded-2xl px-6 text-center text-2xl font-black tracking-[0.5em] text-on-surface focus:border-primary-container transition-all outline-none placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 <p className="text-[9px] text-on-surface-variant/40 font-black text-center mt-6 leading-relaxed uppercase tracking-widest italic">
 Inject the 6-digit cryptographic signature generated by your authorized hardware node or secure mobile application.
 </p>
 </div>

 <button 
 type="submit"
 disabled={loading}
 className="w-full h-20 bg-primary-container text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-primary-container/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mt-8 disabled:opacity-30"
 >
 {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Handshake'}
 </button>

 <button 
 type="button"
 onClick={() => setStep(1)}
 className="w-full text-center text-[10px] text-on-surface-variant/40 font-black hover:text-on-surface transition-all uppercase tracking-[0.3em] cursor-pointer mt-4 italic"
 >
 Reset Verification Sequence
 </button>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}

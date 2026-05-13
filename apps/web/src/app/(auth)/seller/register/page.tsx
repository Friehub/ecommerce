'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckSquare, ArrowRight, UserPlus, File, Eye } from 'lucide-react';
import Link from 'next/link';

export default function SellerRegistrationKYCPage() {
 const [step, setStep] = useState(1);
 const [businessName, setBusinessName] = useState('');
 const [email, setEmail] = useState('');
 const [phone, setPhone] = useState('');
 const [cacDoc, setCacDoc] = useState<any>(null);

 const handleNextStep = (e: React.FormEvent) => {
 e.preventDefault();
 if (step === 1 && businessName && email && phone) {
 setStep(2);
 }
 };

 return (
 <div className="min-h-screen bg-surface-container-lowest flex flex-col justify-center items-center py-20 px-4 relative overflow-hidden">
 {/* Decorative background elements */}
 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--surface)_0%,var(--surface-container-lowest)_100%)] z-0" />
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tertiary-container/5 rounded-full blur-[120px] z-0" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px] z-0" />

 <div className="w-full max-w-[500px] bg-surface rounded-[40px] shadow-soft border border-outline-variant/10 relative z-10 overflow-hidden transition-all duration-500">
 <div className="bg-on-surface p-10 text-center relative">
 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
 <div className="relative z-10">
 <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-container/40 rotate-6 hover:rotate-0 transition-transform duration-500">
 <UserPlus size={40} className="text-white" />
 </div>
 <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Merchant Registration</h1>
 <div className="flex items-center justify-center gap-4">
 <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 1 ? 'bg-primary-container' : 'bg-success'}`} />
 <div className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step === 2 ? 'bg-primary-container' : 'bg-white/20'}`} />
 </div>
 <p className="text-primary-fixed-dim/80 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
 {step === 1 ? 'Step 1: Store Information' : 'Step 2: KYC Verification'}
 </p>
 </div>
 </div>

 <div className="p-10 md:p-12">
 {step === 1 ? (
 <form onSubmit={handleNextStep} className="space-y-8">
 <div className="space-y-3">
 <label className="text-[11px] font-black uppercase text-on-surface-variant tracking-widest ml-1 opacity-40">Business Identity</label>
 <div className="relative group">
 <input 
 type="text" 
 required
 value={businessName}
 onChange={(e) => setBusinessName(e.target.value)}
 placeholder="e.g. Global Tech Solutions"
 className="w-full h-16 px-6 border-2 border-outline-variant/10 bg-surface-container-low/50 focus:border-primary-container focus:bg-white rounded-2xl outline-none font-bold text-on-surface transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[11px] font-black uppercase text-on-surface-variant tracking-widest ml-1 opacity-40">Contact Email</label>
 <div className="relative group">
 <input 
 type="email" 
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="partner@business.com"
 className="w-full h-16 px-6 border-2 border-outline-variant/10 bg-surface-container-low/50 focus:border-primary-container focus:bg-white rounded-2xl outline-none font-bold text-on-surface transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>
 </div>

 <div className="space-y-3">
 <label className="text-[11px] font-black uppercase text-on-surface-variant tracking-widest ml-1 opacity-40">Business Line</label>
 <div className="relative group">
 <input 
 type="tel" 
 required
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+234 ..."
 className="w-full h-16 px-6 border-2 border-outline-variant/10 bg-surface-container-low/50 focus:border-primary-container focus:bg-white rounded-2xl outline-none font-bold text-on-surface transition-all duration-300 placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 </div>
 </div>

 <button 
 type="submit"
 className="w-full h-16 bg-primary-container text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-[1px] duration-300 transition-all flex items-center justify-center gap-4 cursor-pointer mt-10"
 >
 PROCEED TO KYC <ArrowRight size={22} />
 </button>

 <div className="mt-10 pt-10 border-t border-outline-variant/10 text-center">
 <p className="text-[11px] font-bold text-on-surface-variant tracking-wide opacity-40 uppercase">
 Already a merchant? 
 <Link href="/seller/login" className="text-primary-container hover:underline ml-1 font-black">Login to Center</Link>
 </p>
 </div>
 </form>
 ) : (
 <form className="space-y-8">
 <div className="space-y-4">
 <label className="text-[11px] font-black uppercase text-on-surface-variant tracking-widest ml-1 opacity-40">Identification Document</label>
 <div className="border-3 border-dashed border-outline-variant/20 bg-surface-container-low/30 hover:border-primary-container hover:bg-primary-container/5 duration-500 transition-all rounded-[32px] p-10 text-center relative cursor-pointer group">
 <input 
 type="file" 
 onChange={(e) => setCacDoc(e.target.files?.[0] || null)}
 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
 />
 <div className="relative z-10 flex flex-col items-center">
 {cacDoc ? (
 <>
 <div className="w-16 h-16 bg-success/10 border-2 border-success/20 text-success rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-success/10">
 <CheckSquare size={32} />
 </div>
 <span className="font-black text-sm text-on-surface block truncate max-w-full px-4">{cacDoc.name}</span>
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-container mt-3 bg-white px-4 py-1.5 rounded-full border border-primary-container/10 shadow-sm">
 Attached Successfully
 </span>
 </>
 ) : (
 <>
 <div className="w-16 h-16 bg-primary-container/5 border-2 border-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-container/10 group-hover:scale-110 transition-transform duration-500">
 <Upload size={32} />
 </div>
 <span className="font-black text-sm text-on-surface tracking-tight block">Upload Verification Document</span>
 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-2">
 PDF, PNG, JPG (Max 10MB)
 </span>
 </>
 )}
 </div>
 </div>
 <div className="bg-tertiary/5 p-4 rounded-2xl border border-tertiary/10 flex gap-3">
 <FileText size={18} className="text-tertiary shrink-0" />
 <p className="text-[10px] text-tertiary font-bold leading-relaxed uppercase tracking-tight opacity-70">
 Required: CAC Certificate, National ID, or Tax Clearance.
 </p>
 </div>
 </div>

 <Link 
 href="/seller/dashboard"
 className="w-full h-16 bg-primary-container text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-[1px] duration-300 transition-all flex items-center justify-center gap-4"
 >
 FINALIZE ONBOARDING
 </Link>

 <button 
 type="button"
 onClick={() => setStep(1)}
 className="w-full text-center text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] hover:text-primary-container transition-all cursor-pointer mt-4 opacity-40"
 >
 ← Back to Information
 </button>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}

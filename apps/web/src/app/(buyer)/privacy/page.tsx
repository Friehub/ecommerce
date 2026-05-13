'use client';

import React from 'react';
import { ShieldCheck, FileText, ChevronRight, Fingerprint, Lock, Scale } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyTermsPage() {
 return (
 <div className="bg-background min-h-screen pb-24 select-none">
 <div className="container py-12 max-w-5xl mx-auto px-6">
 {/* Breadcrumbs */}
 <div className="flex items-center gap-3 mb-10 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.4em]">
 <Link href="/" className="hover:text-primary-container transition-colors">Hub</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Legal Framework</span>
 </div>

 {/* Hero Banner */}
 <div className="bg-surface-container-lowest rounded-[48px] border-4 border-surface-container-low shadow-soft p-10 md:p-14 flex flex-col md:flex-row items-center gap-8 mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
 <div className="w-20 h-20 bg-primary-container/10 border-2 border-primary-container/20 rounded-[28px] flex items-center justify-center text-primary-container shadow-xl shadow-primary-container/5 shrink-0">
 <Fingerprint size={40} />
 </div>
 <div className="text-center md:text-left">
 <h1 className="text-3xl md:text-4xl font-black text-on-surface tracking-tighter uppercase leading-none mb-3">Privacy & <span className="text-primary-container">Encryption</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic">Protocol Version 2.0.6 • Effective May 2026</p>
 </div>
 </div>

 {/* Content Section */}
 <div className="bg-surface-container-lowest rounded-[56px] border-4 border-surface-container-low shadow-soft p-10 md:p-16 space-y-16 select-text animate-in fade-in slide-in-from-bottom-8 duration-1000">
 <section className="space-y-6">
 <div className="flex items-center gap-4 border-b-2 border-surface-container-low pb-6">
 <div className="p-3 bg-surface-container-low rounded-xl text-primary-container border-2 border-surface-container-low">
 <Scale size={20} />
 </div>
 <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">1. Jurisdictional <span className="text-primary-container">Terms</span></h2>
 </div>
 <p className="text-[11px] font-black text-on-surface-variant/60 leading-relaxed uppercase tracking-widest italic pl-16">
 By accessing the Jumia Clone platform, you confirm that you agree to the conditions, notices, and legal disclosures set out within these General Terms. 
 The platform facilitates buying and selling between multi-vendor sellers and individual buyers under an authorized diagnostic and operational framework.
 </p>
 </section>

 <section className="space-y-6">
 <div className="flex items-center gap-4 border-b-2 border-surface-container-low pb-6">
 <div className="p-3 bg-surface-container-low rounded-xl text-primary-container border-2 border-surface-container-low">
 <Lock size={20} />
 </div>
 <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">2. Identity & <span className="text-primary-container">Data Integrity</span></h2>
 </div>
 <p className="text-[11px] font-black text-on-surface-variant/60 leading-relaxed uppercase tracking-widest italic pl-16">
 We collect identity information (e.g., your first name, last name, phone number, and delivery addresses) to perform direct transaction fulfillment. Your details will not be shared with unauthorized external processing networks. All passwords and authentication parameters are securely hashed using high-grade cryptographic measures and temporal rotation.
 </p>
 </section>

 <section className="space-y-6">
 <div className="flex items-center gap-4 border-b-2 border-surface-container-low pb-6">
 <div className="p-3 bg-surface-container-low rounded-xl text-primary-container border-2 border-surface-container-low">
 <ShieldCheck size={20} />
 </div>
 <h2 className="text-xl font-black text-on-surface tracking-tighter uppercase leading-none">3. Secure <span className="text-primary-container">Settlements</span></h2>
 </div>
 <p className="text-[11px] font-black text-on-surface-variant/60 leading-relaxed uppercase tracking-widest italic pl-16">
 Payments processed across our network are securely verified through authorized Paystack and bank-grade interfaces. Escrow processing maintains all balances until deliveries pass basic client verification. This protects individual buyers from fraudulent product distribution and systemic failures.
 </p>
 </section>
 </div>
 
 {/* Footer Note */}
 <div className="mt-16 text-center">
 <p className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.5em] italic">Authorized Legal Repository • Non-Repudiation Enabled</p>
 </div>
 </div>
 </div>
 );
}

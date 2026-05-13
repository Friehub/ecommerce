'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Video, Activity, ShieldCheck, Zap, Globe, ArrowRight, Gavel } from 'lucide-react';

const FacebookIcon = ({ size = 24 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
 </svg>
);

const XIcon = ({ size = 24 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.36l4.73 6.258L18.244 2.25z" />
 </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
 <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
 <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
 </svg>
);

const YoutubeIcon = ({ size = 24 }: { size?: number }) => (
 <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
 </svg>
);

export const Footer = () => {
 return (
 <footer className="bg-background border-t-8 border-surface-container-low mt-32 relative overflow-hidden">
 <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[200px] -translate-y-1/2 pointer-events-none" />
 
 <div className="container mx-auto px-6 lg:px-12 pt-24 pb-12 relative z-10">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
 <div className="lg:col-span-4 space-y-10">
 <h3 className="text-4xl font-black text-on-surface tracking-tighter flex items-center group cursor-default leading-none">
 JUMIA<span className="text-primary-container ml-1 group-hover:rotate-12 transition-transform">★</span>
 </h3>
 <p className="text-on-surface-variant/40 text-[11px] font-black uppercase tracking-[0.3em] leading-loose italic max-w-sm">
 AFRICA'S PREMIER DESTINATION FOR HIGH-END ELECTRONICS, ELITE FASHION, AND GLOBAL LIFESTYLE NODES. ENGINEERED FOR SUPREMACY.
 </p>
 <div className="flex gap-6 pt-4">
 {[FacebookIcon, XIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
 <button key={i} className="w-14 h-14 rounded-2xl bg-surface-container-low/30 flex items-center justify-center text-on-surface-variant/40 hover:text-primary-container hover:bg-on-surface hover:text-white transition-all active:scale-90 border-2 border-surface-container-low shadow-xl group/icon">
 <Icon size={20} className="group-hover/icon:scale-110 transition-transform" />
 </button>
 ))}
 </div>
 </div>
 
 <div className="lg:col-span-2 flex flex-col gap-10">
 <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary-container italic">Control Center</h4>
 <nav className="flex flex-col gap-6">
 {['Help Center', 'Return Policy', 'Privacy & Security', 'Flash Sales Guide'].map((item) => (
 <Link key={item} href="#" className="text-on-surface-variant/60 hover:text-on-surface transition-all text-[10px] font-black uppercase tracking-[0.3em] group flex items-center gap-4">
 <div className="w-2 h-2 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all" />
 {item}
 </Link>
 ))}
 </nav>
 </div>

 <div className="lg:col-span-2 flex flex-col gap-10">
 <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary-container italic">Global Enterprise</h4>
 <nav className="flex flex-col gap-6">
 {['Partner with Us', 'Seller Academy', 'Logistics Fleet', 'Official Stores'].map((item) => (
 <Link key={item} href="#" className="text-on-surface-variant/60 hover:text-on-surface transition-all text-[10px] font-black uppercase tracking-[0.3em] group flex items-center gap-4">
 <div className="w-2 h-2 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all" />
 {item}
 </Link>
 ))}
 </nav>
 </div>

 <div className="lg:col-span-4 flex flex-col gap-12">
 <div className="space-y-6 bg-surface-container-low/20 p-8 rounded-[40px] border-4 border-surface-container-low shadow-inner">
 <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-on-surface flex items-center gap-3 italic">
 <Zap size={14} className="text-primary-container" /> Newsletter Payload
 </h4>
 <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.3em] leading-relaxed italic">SUBSCRIBE TO RECEIVE ELITE UPDATES ON NEW ARRIVALS AND SEASONAL PROTOCOLS.</p>
 <div className="relative group">
 <input 
 type="email" 
 placeholder="TRANSMIT EMAIL IDENTITY..." 
 className="w-full h-16 bg-background border-4 border-surface-container-low rounded-[24px] px-8 text-[10px] font-black uppercase tracking-[0.3em] focus:outline-none focus:border-primary-container transition-all text-on-surface placeholder:font-normal placeholder:text-on-surface-variant/50"
 />
 <button className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-on-surface text-white rounded-xl shadow-2xl hover:bg-primary-container active:scale-90 transition-all flex items-center justify-center">
 <Send size={18} />
 </button>
 </div>
 </div>
 
 <div className="space-y-6 px-4">
 <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-on-surface flex items-center gap-3 italic">
 <ShieldCheck size={14} className="text-success" /> Verified Settlement Nodes
 </h4>
 <div className="flex gap-4 flex-wrap">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="h-10 w-16 bg-surface-container-low/50 rounded-xl border-2 border-surface-container-low shadow-inner grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-pointer flex items-center justify-center">
 <div className="w-8 h-2 bg-on-surface-variant/10 rounded-full" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="pt-12 border-t-4 border-surface-container-low flex flex-col xl:flex-row justify-between items-center gap-10">
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center border-2 border-surface-container-low">
 <Globe size={24} className="text-on-surface-variant/20" />
 </div>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic leading-none">
 © 2026 JUMIA CLONE ECOSYSTEM. ENGINEERED FOR SUPREMACY AND OPERATIONAL EXCELLENCE.
 </p>
 </div>
 <div className="flex items-center gap-12">
 {['Terms', 'Privacy', 'Cookies'].map((item) => (
 <Link key={item} href="#" className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.4em] hover:text-primary-container transition-all relative group">
 {item}
 <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-container opacity-0 group-hover:opacity-100 transition-all" />
 </Link>
 ))}
 </div>
 </div>
 </div>
 
 {/* Footer Bottom Glow */}
 <div className="h-2 bg-gradient-to-r from-primary-container/0 via-primary-container/40 to-primary-container/0" />
 </footer>
 );
};

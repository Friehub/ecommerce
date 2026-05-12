'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Video } from 'lucide-react';

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
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-black text-on-surface tracking-tighter flex items-center group cursor-default">
              JUMIA <span className="text-primary-container ml-1 group-hover:rotate-12 transition-transform">★</span>
            </h3>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic">
              Africa's premier destination for high-end electronics, elite fashion, and global lifestyle essentials.
            </p>
            <div className="flex gap-4 pt-2">
              {[FacebookIcon, XIcon, InstagramIcon, YoutubeIcon].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all active:scale-90 border border-outline-variant">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-on-surface">Customer Support</h4>
            <nav className="flex flex-col gap-4">
              {['Help Center', 'Return Policy', 'Privacy & Security', 'Flash Sales Guide'].map((item) => (
                <Link key={item} href="#" className="text-on-surface-variant hover:text-primary-container transition-all text-xs font-black uppercase tracking-widest group flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-on-surface">Global Enterprise</h4>
            <nav className="flex flex-col gap-4">
              {['Partner with Us', 'Seller Academy', 'Logistics Fleet', 'Official Stores'].map((item) => (
                <Link key={item} href="#" className="text-on-surface-variant hover:text-primary-container transition-all text-xs font-black uppercase tracking-widest group flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-on-surface">Newsletter</h4>
              <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed italic">Get elite updates on new arrivals and seasonal offers.</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="w-full bg-surface-container-low border-2 border-outline-variant rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary-container transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-container text-white p-2 rounded-xl shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-95 transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-on-surface">Verified Payment</h4>
              <div className="flex gap-3 flex-wrap">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-12 bg-surface-container rounded-xl border border-outline-variant shadow-sm grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-pointer" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em]">
            © 2026 Jumia Clone Ecosystem. Engineered for Excellence.
          </p>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Cookies'].map((item) => (
              <Link key={item} href="#" className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary-container transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};



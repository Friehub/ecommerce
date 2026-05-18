'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Share2, Globe, ExternalLink, Link2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#1a1a1a] mt-12">
      {/* Newsletter Section */}
      <div className="bg-j-text text-white py-12">
        <div className="max-w-[1184px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">New to FreshCart?</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase">Subscribe to our newsletter to get updates on our latest offers!</p>
            </div>
          </div>
          <div className="flex-1 max-w-xl w-full flex gap-2">
            <Input 
              placeholder="Enter E-mail Address" 
              className="bg-white border-transparent text-j-text h-12"
            />
            <div className="flex gap-2">
              <Button className="h-12 px-8 font-black uppercase whitespace-nowrap" variant="outline">Male</Button>
              <Button className="h-12 px-8 font-black uppercase whitespace-nowrap" variant="outline">Female</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1184px] mx-auto py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-2">LET US HELP YOU</h4>
            <Link href="/help" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Help Center</Link>
            <Link href="/help" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">How to buy on FreshCart</Link>
            <Link href="/help" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Delivery timelines</Link>
            <Link href="/support" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Return Policy</Link>
            <Link href="/support" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Corporate & Bulk Purchase</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-2">ABOUT FRESHCART</h4>
            <Link href="/help" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">About Us</Link>
            <Link href="/support" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">FreshCart Careers</Link>
            <Link href="/jumia-express" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Express Delivery</Link>
            <Link href="/privacy" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Terms and Conditions</Link>
            <Link href="/privacy" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Privacy Notice</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-2">MAKE MONEY WITH FRESHCART</h4>
            <Link href="/seller" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Sell on FreshCart</Link>
            <Link href="/seller" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Become a Sales Consultant</Link>
            <Link href="/support" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Become a Logistics Partner</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-2">FRESHCART INTERNATIONAL</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Algeria</Link>
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Egypt</Link>
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Ghana</Link>
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Kenya</Link>
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Morocco</Link>
              <Link href="/" className="text-[10px] font-bold text-white/60 hover:text-jumia-orange transition-colors uppercase">Nigeria</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/10 gap-8">
          <div className="flex items-center gap-6">
            <Link2 className="text-white/60 hover:text-white transition-colors cursor-pointer" size={20} />
            <Globe className="text-white/60 hover:text-white transition-colors cursor-pointer" size={20} />
            <Share2 className="text-white/60 hover:text-white transition-colors cursor-pointer" size={20} />
            <ExternalLink className="text-white/60 hover:text-white transition-colors cursor-pointer" size={20} />
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            © {new Date().getFullYear()} FreshCart. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

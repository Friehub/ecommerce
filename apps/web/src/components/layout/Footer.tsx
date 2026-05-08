'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Video, Apple, Play } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-stack-lg">
      <div className="flex flex-col items-center py-stack-lg px-gutter max-w-container-max mx-auto">
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-stack-lg mb-12 text-on-surface">
          <div className="col-span-1">
            <h3 className="text-2xl font-black text-primary mb-6 flex items-center">
              JUMIA <span className="text-primary-container ml-1">★</span>
            </h3>
            <p className="text-on-surface-variant text-body-md leading-relaxed">
              The best e-commerce platform providing quality products at the best prices with nationwide delivery.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">Customer Service</h4>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Help Center</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Return Policy</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Privacy Policy</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold uppercase tracking-wider text-sm">About Jumia</h4>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Sell on Jumia</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Terms & Conditions</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-label-sm">Our Story</Link>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-bold uppercase tracking-wider text-sm">Join Us</h4>
            <div className="flex gap-4">
              <MessageCircle size={20} className="cursor-pointer text-on-surface-variant hover:text-primary transition-colors" />
              <Send size={20} className="cursor-pointer text-on-surface-variant hover:text-primary transition-colors" />
              <Camera size={20} className="cursor-pointer text-on-surface-variant hover:text-primary transition-colors" />
              <Video size={20} className="cursor-pointer text-on-surface-variant hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-on-surface-variant">Payment Methods</h4>
              <div className="flex gap-2 opacity-60">
                <div className="h-6 w-10 bg-surface-container rounded border border-outline-variant" />
                <div className="h-6 w-10 bg-surface-container rounded border border-outline-variant" />
                <div className="h-6 w-10 bg-surface-container rounded border border-outline-variant" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-outline-variant pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            © 2026 Jumia Clone. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};


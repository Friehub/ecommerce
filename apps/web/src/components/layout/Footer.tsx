'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Video, Apple, Play } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#282828] text-white mt-12 pb-12">
      <div className="container mx-auto px-4">
        {/* Newsletter / App Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">New to Jumia?</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter to get updates on our latest offers!</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter E-mail Address" 
                className="flex-1 h-11 bg-white text-gray-900 px-4 rounded focus:outline-none focus:ring-1 focus:ring-[#F68B1E]"
              />
              <div className="flex gap-2">
                <button className="flex-1 sm:flex-none border border-white px-5 h-11 rounded font-bold hover:bg-white hover:text-[#282828] transition-all uppercase text-xs tracking-widest">
                  Male
                </button>
                <button className="flex-1 sm:flex-none border border-white px-5 h-11 rounded font-bold hover:bg-white hover:text-[#282828] transition-all uppercase text-xs tracking-widest">
                  Female
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Download Jumia Free App</h3>
            <p className="text-gray-400 text-sm mb-4 md:text-right">Get access to exclusive offers!</p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 transition-colors">
                <Apple size={24} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Download on the</div>
                  <div className="text-sm font-bold leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 transition-colors">
                <Play size={24} />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Get it on</div>
                  <div className="text-sm font-bold leading-tight">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-gray-500">Need Help?</h4>
            <ul className="text-gray-400 text-xs space-y-3 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Chat with us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-gray-500">About Jumia</h4>
            <ul className="text-gray-400 text-xs space-y-3 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Jumia careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Jumia Express</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-gray-500">Make Money</h4>
            <ul className="text-gray-400 text-xs space-y-3 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Sell on Jumia</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Vendor Hub</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Become a Logistics Partner</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">JForce Affiliate Program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-[0.2em] text-gray-500">Join Us</h4>
            <div className="flex gap-4">
              <MessageCircle size={20} className="cursor-pointer text-gray-400 hover:text-[#F68B1E] transition-colors" />
              <Send size={20} className="cursor-pointer text-gray-400 hover:text-[#F68B1E] transition-colors" />
              <Camera size={20} className="cursor-pointer text-gray-400 hover:text-[#F68B1E] transition-colors" />
              <Video size={20} className="cursor-pointer text-gray-400 hover:text-[#F68B1E] transition-colors" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            © 2026 Jumia Clone. All Rights Reserved.
          </p>
          <div className="flex gap-4 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Payment Method Icons Placeholder */}
            <div className="h-6 w-10 bg-white/10 rounded" />
            <div className="h-6 w-10 bg-white/10 rounded" />
            <div className="h-6 w-10 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </footer>
  );
};


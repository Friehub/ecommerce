'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Video, Apple, Play } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#282828] text-white mt-12 pb-12">
      <div className="container">
        {/* Newsletter / App Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold mb-4">NEW TO JUMIA?</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter to get updates on our latest offers!</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter E-mail Address" 
                className="flex-1 h-11 bg-white text-gray-900 px-4 rounded focus:outline-none"
              />
              <button className="bg-transparent border border-white px-6 h-11 rounded font-bold hover:bg-white hover:text-[#282828] transition-all">
                MALE
              </button>
              <button className="bg-transparent border border-white px-6 h-11 rounded font-bold hover:bg-white hover:text-[#282828] transition-all">
                FEMALE
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <h3 className="text-xl font-bold mb-4">DOWNLOAD JUMIA FREE APP</h3>
            <p className="text-gray-400 text-sm mb-4 text-right">Get access to exclusive offers!</p>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded">
                <Apple size={24} />
                <div className="text-left">
                  <div className="text-[10px]">Download on the</div>
                  <div className="text-sm font-bold leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-black border border-gray-700 px-4 py-2 rounded">
                <Play size={24} />
                <div className="text-left">
                  <div className="text-[10px]">GET IT ON</div>
                  <div className="text-sm font-bold leading-tight">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <h4 className="font-bold mb-4">NEED HELP?</h4>
            <ul className="text-gray-400 text-xs space-y-2">
              <li><Link href="#">Chat with us</Link></li>
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">ABOUT JUMIA</h4>
            <ul className="text-gray-400 text-xs space-y-2">
              <li><Link href="#">About us</Link></li>
              <li><Link href="#">Jumia careers</Link></li>
              <li><Link href="#">Jumia Express</Link></li>
              <li><Link href="#">Terms and Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">MAKE MONEY WITH JUMIA</h4>
            <ul className="text-gray-400 text-xs space-y-2">
              <li><Link href="#">Sell on Jumia</Link></li>
              <li><Link href="#">Vendor Hub</Link></li>
              <li><Link href="#">Become a Logistics Partner</Link></li>
              <li><Link href="#">JForce Affiliate Program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">JOIN US ON</h4>
            <div className="flex gap-4 mb-8">
              <MessageCircle size={24} className="cursor-pointer hover:text-[#F68B1E]" />
              <Send size={24} className="cursor-pointer hover:text-[#F68B1E]" />
              <Camera size={24} className="cursor-pointer hover:text-[#F68B1E]" />
              <Video size={24} className="cursor-pointer hover:text-[#F68B1E]" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .gap-12 { gap: 48px; }
        .py-12 { padding-top: 48px; padding-bottom: 48px; }
        .pb-12 { padding-bottom: 48px; }
        .mt-12 { margin-top: 48px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-8 { margin-bottom: 32px; }
        .border-b { border-bottom: 1px solid #374151; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .items-end { align-items: flex-end; }
        .text-xl { font-size: 1.25rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .font-bold { font-weight: 700; }
        .leading-tight { line-height: 1.25; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 8px; }
        .text-gray-400 { color: #9ca3af; }
        .text-gray-900 { color: #111827; }
        .bg-white { background-color: #ffffff; }
        .bg-black { background-color: #000000; }
        .border-gray-700 { border-color: #374151; }
        .rounded { border-radius: 4px; }
        .cursor-pointer { cursor: pointer; }
        
        @media (min-width: 768px) {
          .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `}</style>
    </footer>
  );
};

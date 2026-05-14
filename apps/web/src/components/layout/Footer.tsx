// apps/web/src/components/layout/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full py-stack-lg px-margin-desktop bg-j-surface-container-highest border-t border-j-outline-variant mt-12">
      <div className="max-w-container-max mx-auto w-full">
        <h2 className="text-display-lg font-bold text-j-text mb-6">Jumia</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-body-md font-bold text-j-text uppercase tracking-wider">ABOUT JUMIA</h4>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">About Us</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Jumia Careers</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Terms and Conditions</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Privacy Notice</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-body-md font-bold text-j-text uppercase tracking-wider">PAYMENT</h4>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Jumia Pay</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Cards</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Bank Transfer</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-body-md font-bold text-j-text uppercase tracking-wider">BUYING ON JUMIA</h4>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Help Center</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Track My Order</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Return Policy</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-body-md font-bold text-j-text uppercase tracking-wider">MAKE MONEY</h4>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Sell on Jumia</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Become a Logistics Partner</Link>
            <Link href="#" className="text-body-sm text-j-secondary hover:text-jumia-orange transition-colors">Join the JForce</Link>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-j-outline-variant">
          <p className="text-body-sm text-j-secondary">© {new Date().getFullYear()} Jumia. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

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
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center py-12 px-4 select-none bg-[#F8F9FA]">
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden duration-300 transition-all hover:shadow-black/10">
        <div className="p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-[#FF7A00]">
              <UserPlus size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Register as a Seller</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1.5 bg-gray-50/80 px-3 py-1 rounded w-fit mx-auto border border-gray-100">
              {step === 1 ? 'Step 1 of 2: Store Information' : 'Step 2 of 2: KYC & Identification Document'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider">
                  Store or Registered Business Name
                </label>
                <input 
                  type="text" 
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enterprise Ltd"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#FF7A00] focus:bg-white transition-all shadow-sm duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider">
                  Operational Email Address
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@enterprise.dev"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#FF7A00] focus:bg-white transition-all shadow-sm duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider">
                  Contact Phone Number
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080 1234 5678"
                  className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 h-12 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#FF7A00] focus:bg-white transition-all shadow-sm duration-200"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:shadow-lg active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 border border-transparent shadow-md mt-6 select-none cursor-pointer"
              >
                PROCEED TO KYC <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] md:text-xs font-black uppercase text-gray-500 tracking-wider">
                  Corporate Registration Document
                </label>
                <div className="border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-orange-300 hover:bg-orange-50/10 duration-200 transition-all rounded-2xl p-6 text-center select-none cursor-pointer flex flex-col items-center justify-center min-h-[140px] relative">
                  <input 
                    type="file" 
                    onChange={(e) => setCacDoc(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {cacDoc ? (
                    <>
                      <div className="w-10 h-10 bg-green-50 border border-green-100 text-green-600 rounded-xl flex items-center justify-center mb-2">
                        <CheckSquare size={20} />
                      </div>
                      <span className="font-extrabold text-xs text-gray-800 leading-tight block truncate max-w-full">{cacDoc.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#264996] mt-1 flex items-center gap-1">
                        FILE ATTACHED <Eye size={12} />
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-orange-50 border border-orange-100 text-[#FF7A00] rounded-xl flex items-center justify-center mb-2">
                        <Upload size={20} />
                      </div>
                      <span className="font-extrabold text-xs text-gray-800 tracking-tight block">Browse to upload file</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                        PDF, PNG, JPG (Max 5MB)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium text-center mt-2 leading-relaxed">
                  Please attach corporate registration certificates or verifiable identity cards.
                </p>
              </div>

              <Link 
                href="/seller/dashboard"
                className="w-full h-12 bg-[#FF7A00] hover:bg-[#E66E00] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider hover:shadow-lg active:scale-95 duration-200 transition-all flex items-center justify-center gap-2 border border-transparent shadow-md mt-6 select-none"
              >
                FINALIZE ONBOARDING
              </Link>

              <button 
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-gray-400 font-bold hover:text-gray-600 transition-all uppercase tracking-wider cursor-pointer mt-2"
              >
                Go back to Step 1
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

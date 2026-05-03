'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ChevronRight, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    // Simulate parse & network upload
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setFile(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      <div className="flex items-center gap-2 font-bold text-gray-500 text-xs">
        <Link href="/seller/dashboard" className="hover:text-[#F68B1E] transition-colors">Dashboard</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href="/seller/inventory" className="hover:text-[#F68B1E] transition-colors">Inventory</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-extrabold">Bulk Upload</span>
      </div>

      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Bulk Catalog Upload</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">Upload products, variations, pricing, and tags simultaneously via CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dropzone Container */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-6 md:p-8 shadow-md">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-gray-200 hover:border-[#F68B1E] rounded-2xl p-8 text-center bg-gray-50/20 hover:bg-orange-50/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] select-none relative">
              <input 
                type="file" 
                accept=".csv,.xlsx" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-14 h-14 bg-orange-50 text-[#F68B1E] rounded-full flex items-center justify-center border border-orange-100/60 mb-4 flex-shrink-0">
                <Upload size={26} />
              </div>
              {file ? (
                <div>
                  <p className="text-sm font-extrabold text-gray-800">{file.name}</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-extrabold text-gray-800">Drag & drop your catalog file</p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">Supports standard .csv and .xlsx formats</p>
                </div>
              )}
            </div>

            {success && (
              <div className="bg-green-50 text-green-700 font-bold border border-green-100 p-3.5 rounded-xl text-xs md:text-sm flex items-center gap-2 animate-pulse">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                Products imported and added to moderation queue successfully!
              </div>
            )}

            <button 
              type="submit" 
              disabled={!file || uploading}
              className="w-full h-12 bg-[#F68B1E] hover:bg-[#e07a1a] text-white rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 duration-200 flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed select-none"
            >
              {uploading ? 'Processing & Validating...' : 'Start Upload'}
            </button>
          </form>
        </div>

        {/* Template info */}
        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 duration-300 transition-all p-5 shadow-md h-fit">
          <h3 className="font-extrabold text-gray-900 text-sm tracking-tight border-b border-gray-100 pb-3 mb-4 flex items-center gap-2 uppercase">
            <FileText size={16} className="text-[#F68B1E]" /> Guidelines
          </h3>
          <p className="text-xs font-medium text-gray-500 leading-relaxed mb-4">
            Ensure your file conforms to the canonical seller schema to prevent parsing rejections.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs font-medium text-gray-600 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
              <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>Provide title, SKU, variant, price, and media URL columns.</span>
            </div>
            <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 h-10 rounded-xl font-extrabold text-xs uppercase transition-all flex items-center justify-center gap-2 tracking-wide mt-2">
              <Download size={14} /> Download Sample CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

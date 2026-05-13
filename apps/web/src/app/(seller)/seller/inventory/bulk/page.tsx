'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ChevronRight, Download, AlertCircle, Loader2, Database, Layers } from 'lucide-react';
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
 <div className="space-y-10 select-none max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="flex items-center gap-3 font-black text-on-surface-variant text-[10px] uppercase tracking-[0.3em]">
 <Link href="/seller/dashboard" className="hover:text-primary-container transition-colors">Hub</Link>
 <ChevronRight size={14} className="opacity-30" />
 <Link href="/seller/inventory" className="hover:text-primary-container transition-colors">Assets</Link>
 <ChevronRight size={14} className="opacity-30" />
 <span className="text-on-surface">Bulk Ingest</span>
 </div>

 <div className="flex items-center gap-5">
 <div className="w-16 h-16 bg-primary-container/10 border-2 border-primary-container/20 rounded-[20px] flex items-center justify-center text-primary-container shadow-xl shadow-primary-container/5">
 <Database size={32} />
 </div>
 <div>
 <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase leading-none">Catalog <span className="text-primary-container">Ingestion</span></h1>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mt-2 italic">Batch Upload Protocol v4.2</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
 {/* Dropzone Container */}
 <div className="lg:col-span-8 bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft p-10">
 <form onSubmit={handleUpload} className="space-y-8">
 <div className="group relative">
 <div className="border-4 border-dashed border-surface-container-low hover:border-primary-container/40 rounded-[32px] p-12 text-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[320px] select-none">
 <input 
 type="file" 
 accept=".csv,.xlsx" 
 onChange={handleFileChange} 
 className="absolute inset-0 opacity-0 cursor-pointer z-10"
 />
 <div className="w-20 h-20 bg-surface-container-lowest text-primary-container rounded-[24px] flex items-center justify-center border-2 border-surface-container-low mb-6 shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
 <Upload size={32} />
 </div>
 {file ? (
 <div className="animate-in zoom-in-95">
 <p className="text-sm font-black text-on-surface uppercase tracking-tight">{file.name}</p>
 <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mt-2 italic">Payload Size: {(file.size / 1024).toFixed(1)} KB</p>
 </div>
 ) : (
 <div>
 <p className="text-sm font-black text-on-surface uppercase tracking-tight">Deploy Data Source</p>
 <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] mt-3 italic">CSV or XLSX Matrix Supported</p>
 </div>
 )}
 </div>
 </div>

 {success && (
 <div className="bg-success/5 text-success border-2 border-success/10 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
 <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
 <CheckCircle2 size={20} />
 </div>
 <div>
 <p className="text-[11px] font-black uppercase tracking-tight">Ingestion Successful</p>
 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1 italic">Products synchronized with moderation buffer.</p>
 </div>
 </div>
 )}

 <button 
 type="submit" 
 disabled={!file || uploading}
 className="w-full h-20 bg-on-surface text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-container transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 group"
 >
 {uploading ? (
 <>
 <Loader2 size={20} className="animate-spin" />
 Decrypting & Validating Matrix...
 </>
 ) : (
 <>
 <Layers size={20} className="group-hover:rotate-12 transition-transform" />
 Initiate Sync
 </>
 )}
 </button>
 </form>
 </div>

 {/* Template info */}
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-surface-container-lowest rounded-[40px] border-4 border-surface-container-low shadow-soft p-8 h-fit animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
 <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.4em] mb-8 flex items-center gap-3 italic">
 <FileText size={18} className="text-primary-container" /> Guidelines
 </h3>
 <p className="text-[11px] font-black text-on-surface/40 uppercase tracking-widest leading-relaxed mb-10 italic">
 Ensure your payload conforms to the canonical schema to prevent system rejections.
 </p>
 <div className="space-y-6">
 <div className="flex items-start gap-4 text-[10px] font-black text-on-surface-variant bg-surface-container-low/30 p-6 rounded-2xl border-2 border-surface-container-low">
 <AlertCircle size={18} className="text-primary-container shrink-0" />
 <span className="uppercase tracking-tight leading-relaxed">Required Nodes: Title, SKU, Variant, Valuation, and Media URI.</span>
 </div>
 <button className="w-full h-16 bg-surface-container-low/30 hover:bg-surface-container-low text-on-surface border-2 border-surface-container-low rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
 <Download size={18} /> Get Sample Matrix
 </button>
 </div>
 </div>

 <div className="bg-primary-container/5 border-4 border-primary-container/10 rounded-[40px] p-8">
 <p className="text-[9px] font-black text-primary-container uppercase tracking-[0.4em] mb-3 flex items-center gap-2 italic">
 <Layers size={14} /> Buffer System
 </p>
 <p className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest leading-relaxed italic">
 Entities are placed in a 24-hour moderation buffer prior to global availability.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}

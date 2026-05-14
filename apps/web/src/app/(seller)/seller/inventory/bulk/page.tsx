'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ChevronRight, Download, AlertCircle, Loader2, Database, Layers, XCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { useToast } from '@/context/ToastContext';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const { showToast } = useToast();

  const bulkImport = api.catalog.bulkImport.useMutation({
    onSuccess: (data) => {
      setSuccess(true);
      setJobId(data?.jobId ?? null);
      setFile(null);
      showToast('Products queued for import. They will be live within 24 hours after moderation.');
    },
    onError: (err) => {
      showToast(err.message || 'Upload failed. Check your CSV format and try again.', 'error');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setJobId(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // CSV files can be read as text directly.
    // XLSX is not supported here — the backend schema expects csvContent: string.
    if (!file.name.endsWith('.csv')) {
      showToast('Only CSV files are supported. Please convert your spreadsheet to CSV first.', 'error');
      return;
    }

    const csvContent = await file.text();

    if (csvContent.length > 1 * 1024 * 1024) {
      showToast('File is too large. Maximum CSV size is 1MB.', 'error');
      return;
    }

    bulkImport.mutate({ csvContent });
  };

  return (
    <div className="space-y-10 select-none max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-3 font-semibold text-on-surface-variant text-[10px] uppercase ">
        <Link href="/seller/dashboard" className="hover:text-jumia-orange transition-colors">Hub</Link>
        <ChevronRight size={14} className="opacity-30" />
        <Link href="/seller/inventory" className="hover:text-jumia-orange transition-colors">Assets</Link>
        <ChevronRight size={14} className="opacity-30" />
        <span className="text-on-surface">Bulk Ingest</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-jumia-orange/10 border-2 border-jumia-orange/20 rounded-sm flex items-center justify-center text-jumia-orange shadow-xl shadow-primary-container/5">
          <Database size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-on-surface tracking-tighter uppercase leading-none">Catalog <span className="text-jumia-orange">Ingestion</span></h1>
          <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase  mt-2 italic">Batch Upload Protocol — CSV only, max 1MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Dropzone Container */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded border border-surface-container-low shadow-soft p-10">
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="group relative">
              <div className="border border-dashed border-surface-container-low hover:border-jumia-orange/40 rounded p-12 text-center bg-surface-container-low/20 hover:bg-jumia-orange-dark/5 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[320px] select-none">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={bulkImport.isLoading}
                />
                <div className="w-20 h-20 bg-surface-container-lowest text-jumia-orange rounded flex items-center justify-center border-2 border-surface-container-low mb-6 shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Upload size={32} />
                </div>
                {file ? (
                  <div className="animate-in zoom-in-95">
                    <p className="text-sm font-semibold text-on-surface uppercase tracking-tight">{file.name}</p>
                    <p className="text-[10px] font-semibold text-jumia-orange uppercase tracking-widest mt-2 italic">
                      Size: {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-on-surface uppercase tracking-tight">Drop CSV file here</p>
                    <p className="text-[10px] font-semibold text-on-surface-variant/40 uppercase mt-3 italic">CSV format only — max 1MB</p>
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
                  <p className="text-[11px] font-semibold uppercase tracking-tight">Import queued successfully</p>
                  {jobId && (
                    <p className="text-[9px] font-semibold uppercase tracking-widest opacity-60 mt-1 italic">
                      Job ID: {jobId} — Products will go live after moderation (up to 24 hours).
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || bulkImport.isLoading}
              className="w-full h-20 bg-jumia-orange text-white rounded-2xl font-semibold text-xs uppercase shadow-2xl hover:bg-jumia-orange-dark transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 group"
            >
              {bulkImport.isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Uploading &amp; Queuing Products...
                </>
              ) : (
                <>
                  <Layers size={20} className="group-hover:rotate-12 transition-transform" />
                  Start Import
                </>
              )}
            </button>
          </form>
        </div>

        {/* Template info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded border border-surface-container-low shadow-soft p-8 h-fit animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <h3 className="text-[10px] font-semibold text-on-surface uppercase mb-8 flex items-center gap-3 italic">
              <FileText size={18} className="text-jumia-orange" /> CSV Format Guide
            </h3>
            <p className="text-[11px] font-semibold text-on-surface/40 uppercase tracking-widest leading-relaxed mb-10 italic">
              Each row is one product variant. Required columns:
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low/30 p-6 rounded-2xl border-2 border-surface-container-low">
                <AlertCircle size={18} className="text-jumia-orange shrink-0" />
                <span className="uppercase tracking-tight leading-relaxed">title, sku, price, quantity, category_slug, brand</span>
              </div>
              <div className="flex items-start gap-4 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low/30 p-6 rounded-2xl border-2 border-surface-container-low">
                <XCircle size={18} className="text-red-400 shrink-0" />
                <span className="uppercase tracking-tight leading-relaxed">XLSX not supported — export your spreadsheet as CSV first</span>
              </div>
              <button className="w-full h-16 bg-surface-container-low/30 hover:bg-surface-container-low text-on-surface border-2 border-surface-container-low rounded-2xl font-semibold text-[10px] uppercase transition-all flex items-center justify-center gap-3">
                <Download size={18} /> Download Sample CSV
              </button>
            </div>
          </div>

          <div className="bg-jumia-orange/5 border border-jumia-orange/10 rounded p-8">
            <p className="text-[9px] font-semibold text-jumia-orange uppercase mb-3 flex items-center gap-2 italic">
              <Layers size={14} /> Moderation Buffer
            </p>
            <p className="text-[10px] font-semibold text-on-surface/40 uppercase tracking-widest leading-relaxed italic">
              Imported products are reviewed by our team before going live. Allow up to 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

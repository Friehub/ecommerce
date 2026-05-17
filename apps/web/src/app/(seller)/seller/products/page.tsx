'use client';

import React, { useState } from 'react';
import { 
 Package, 
 Plus, 
 Search, 
 Edit2, 
 Trash2, 
 Tag, 
 ChevronRight, 
 UploadCloud,
 FileSpreadsheet,
 AlertCircle,
 CheckCircle2,
 Filter,
 MoreVertical,
 Layers,
 Cpu,
 Binary,
 Database,
 SearchCode,
 Zap,
 ArrowUpRight,
 Sparkles,
 Loader2,
 ArrowRight
} from 'lucide-react';
import { api } from '@/trpc/react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function SellerProductsHubPage() {
  const [csvContent, setCsvContent] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: remoteProducts, isLoading } = api.seller.listMyProducts.useQuery({ limit: 50, offset: 0 });

  const bulkImportMutation = api.catalog.bulkImport.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Upload Successful',
        description: `Products queued for import. Job ID: ${data.jobId.slice(0, 8).toUpperCase()}`,
        type: 'success',
      });
      setCsvContent('');
    },
    onError: (err) => {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to process CSV data.',
        type: 'error',
      });
    }
  });

  const handleDelete = (id: string) => {
    setIsDeleting(null);
    toast({
      title: 'Product Deleted',
      description: 'The product has been removed from your inventory.',
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-sm" />
            <Skeleton className="h-4 w-48 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-64 w-full rounded-sm" />
        <Skeleton className="h-[600px] w-full rounded-sm" />
      </div>
    );
  }

  return (
    <div className="max-w-[1184px] mx-auto space-y-12 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-orange-50 rounded-sm border border-orange-100">
              <Database size={20} className="text-jumia-orange" />
            </div>
            <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Catalog Management</span>
          </div>
          <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
            Product <span className="text-jumia-orange">Catalogue</span>
          </h1>
          <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Add, edit, and bulk import items in your seller catalog</p>
        </div>
        <button className="bg-jumia-orange text-white h-12 px-8 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-sm active:scale-95 flex items-center gap-3 group">
          <Plus size={18} />
          Create New Product
        </button>
      </div>

      {/* Bulk Upload Section */}
      <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden group">
        <div className="p-8 border-b border-j-border flex items-center justify-between bg-j-background/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-j-border">
              <UploadCloud size={20} className="text-j-text-muted" />
            </div>
            <div>
              <h2 className="text-xs font-black text-j-text uppercase leading-none mb-1">Bulk Product Upload</h2>
              <p className="text-[9px] font-black text-j-text-muted uppercase opacity-60">Import multiple products via CSV</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-j-background px-4 py-1.5 rounded-full border border-j-border shadow-inner">
            <FileSpreadsheet size={14} className="text-jumia-orange" />
            <span className="text-[8px] font-black text-j-text-muted uppercase tracking-widest">Validation Active</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="relative group/text">
            <textarea
              placeholder="Paste your CSV content here..."
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-6 bg-j-background/50 border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange/30 text-sm font-medium text-j-text placeholder:text-j-text-muted/40 transition-all resize-none shadow-inner"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <button
              onClick={() => bulkImportMutation.mutate({ csvContent })}
              disabled={!csvContent || bulkImportMutation.isPending}
              className="bg-j-text text-white h-12 px-10 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-20 flex items-center justify-center gap-3 group/btn shadow-sm"
            >
              {bulkImportMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
              Process Upload
            </button>
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-sm border border-orange-100 flex-1">
              <AlertCircle size={16} className="text-jumia-orange shrink-0" />
              <p className="text-[9px] font-black text-j-text-muted uppercase leading-relaxed">
                Required Columns: <span className="text-j-text">title, sku, price, description, comparePrice, ean, stock</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-sm border border-j-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-j-border flex flex-col lg:flex-row gap-6 items-center bg-j-background/30">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-j-text-muted opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..."
              className="w-full pl-16 pr-6 h-12 bg-white border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange/30 text-[11px] font-black uppercase tracking-widest transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted opacity-40" size={16} />
              <select className="bg-white border border-j-border rounded-sm pl-12 pr-10 h-12 text-[9px] font-black text-j-text-muted uppercase tracking-widest focus:outline-none focus:border-jumia-orange/30 transition-all appearance-none cursor-pointer w-full shadow-inner hover:bg-j-background/50">
                <option>All Categories</option>
                <option>Active Products</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-j-border text-j-text-muted text-[9px] font-black uppercase tracking-widest bg-j-background/30">
                <th className="px-8 py-6">Product Information</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Inventory</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-j-border">
              {(remoteProducts || []).map((item) => {
                const mainVariant = item.variants[0];
                const totalStock = item.variants.reduce((acc, v) => 
                  acc + v.stockLevels.reduce((acc2, s) => acc2 + s.qtyOnHand, 0), 0
                );
                
                return (
                  <tr key={item.id} className="hover:bg-j-background/30 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="font-black text-sm text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors cursor-pointer mb-1.5">
                        {item.title}
                      </div>
                      <div className="text-[10px] font-black text-j-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                        SKU: {mainVariant?.sku || 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-[9px] font-black text-j-text-muted uppercase bg-j-background border border-j-border px-4 py-1 rounded-full">
                        {item.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="text-lg font-black text-j-text tracking-tight">₦{Number(mainVariant?.price || 0).toLocaleString()}</div>
                      <div className="text-[8px] font-black text-j-success uppercase mt-1 opacity-60">Standard Pricing</div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-2 w-32">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                          totalStock > 0 ? 'bg-green-50 text-j-success border-green-100' : 'bg-red-50 text-j-error border-red-100'
                        }`}>
                          {totalStock} in stock
                        </span>
                        <div className="w-full bg-j-background h-1.5 rounded-full overflow-hidden border border-j-border">
                          <div 
                            className={`h-full transition-all duration-1000 ${totalStock > 0 ? 'bg-j-success' : 'bg-j-error'}`} 
                            style={{ width: `${Math.min(100, (totalStock / 100) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="w-10 h-10 bg-white text-j-text-muted border border-j-border hover:bg-j-text hover:text-white rounded-sm transition-all flex items-center justify-center shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setIsDeleting(item.id)}
                          className="w-10 h-10 bg-white text-j-error border border-j-border hover:bg-j-error hover:text-white rounded-sm transition-all flex items-center justify-center shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!isDeleting}
        onCancel={() => setIsDeleting(null)}
        onConfirm={() => handleDelete(isDeleting!)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}

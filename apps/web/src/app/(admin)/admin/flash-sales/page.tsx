'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Trash, 
  Plus, 
  Zap, 
  Search, 
  Target, 
  Clock, 
  Box, 
  BarChart3,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  Loader2,
  Fingerprint
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminFlashSalesPage() {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [variantSearch, setVariantSearch] = useState('');
  const { data: flashSales, isLoading: loadingSales } = api.admin.listFlashSales.useQuery();
  const { data: variants, isLoading: loadingVariants } = api.admin.listAllVariants.useQuery(
    variantSearch ? { search: variantSearch } : undefined
  );

  const [variantId, setVariantId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [qtyLimit, setQtyLimit] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const createFlashSaleMutation = api.admin.createFlashSale.useMutation({
    onSuccess: () => {
      utils.admin.listFlashSales.invalidate();
      setVariantId('');
      setSalePrice('');
      setQtyLimit('');
      setStartTime('');
      setEndTime('');
      toast({
        title: 'Campaign Created',
        description: 'Flash sale campaign has been successfully scheduled.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Could not create flash sale.',
        variant: 'destructive',
      });
    }
  });

  const deleteFlashSaleMutation = api.admin.deleteFlashSale.useMutation({
    onSuccess: () => {
      utils.admin.listFlashSales.invalidate();
      toast({
        title: 'Campaign Deleted',
        description: 'Flash sale campaign has been successfully removed.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Could not delete flash sale.',
        variant: 'destructive',
      });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantId || !salePrice || !qtyLimit || !startTime || !endTime) {
      toast({
        title: 'Missing Fields',
        description: 'Please ensure all campaign details are filled.',
        variant: 'destructive',
      });
      return;
    }

    const selectedVariant = variants?.find(v => v.id === variantId);
    if (!selectedVariant) {
      toast({
        title: 'Error',
        description: 'Selected variant not found.',
        variant: 'destructive',
      });
      return;
    }

    createFlashSaleMutation.mutate({
      variantId,
      sellerId: selectedVariant.product.seller.id,
      salePrice: parseFloat(salePrice),
      qtyLimit: parseInt(qtyLimit, 10),
      startTime,
      endTime
    });
  };

  if (loadingSales) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-j-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[600px] w-full rounded-sm" />
          <Skeleton className="h-[600px] lg:col-span-2 w-full rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-j-background min-h-screen pb-24">
      <div className="max-w-[1184px] mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-j-border">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-j-text text-white rounded-sm shadow-sm">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Promotion Management</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Flash <span className="text-jumia-orange">Sales</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Schedule and manage time-limited promotional campaigns</p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white border border-j-border rounded-sm shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-j-text-muted">Active Campaigns: {flashSales?.length || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Create Campaign Form */}
          <div className="bg-white p-8 rounded-sm border border-j-border shadow-sm h-fit sticky top-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-j-border">
              <div className="p-2 bg-j-background rounded-sm text-jumia-orange border border-j-border">
                <Plus size={18} />
              </div>
              <h2 className="text-xs font-black text-j-text uppercase tracking-tight">Create Campaign</h2>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                  Search Product
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30 group-focus-within:text-jumia-orange transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="SKU OR PRODUCT NAME..."
                    value={variantSearch}
                    onChange={(e) => setVariantSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-j-background border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[10px] font-black text-j-text placeholder:font-black placeholder:text-j-text-muted/30 uppercase tracking-widest transition-all shadow-inner"
                  />
                </div>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-[10px] font-black focus:outline-none focus:border-jumia-orange text-j-text appearance-none cursor-pointer uppercase tracking-widest shadow-sm mt-2"
                  required
                >
                  <option value="">SELECT TARGET VARIANT</option>
                  {variants?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.product.title} - {v.sku} (₦{Number(v.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                    Sale Price (₦)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                    Qty Limit
                  </label>
                  <input
                    type="number"
                    value={qtyLimit}
                    onChange={(e) => setQtyLimit(e.target.value)}
                    placeholder="0"
                    className="w-full bg-j-background border border-j-border rounded-sm px-4 py-3 text-xs font-black focus:outline-none focus:border-jumia-orange shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                    Start Date & Time
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30" size={14} />
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-j-background border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[10px] font-black text-j-text shadow-sm appearance-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-j-text uppercase tracking-widest opacity-40">
                    End Date & Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30" size={14} />
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-j-background border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[10px] font-black text-j-text shadow-sm appearance-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={createFlashSaleMutation.isPending}
                className="w-full bg-jumia-orange text-white py-4 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-jumia-orange/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 group/submit mt-4"
              >
                {createFlashSaleMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="group-hover/submit:scale-110 transition-transform" />
                    Create Campaign
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Flash Sales */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black text-j-text uppercase tracking-widest opacity-40 px-2">Campaign List</h3>

            <div className="grid gap-6">
              {flashSales?.map((sale) => (
                <div key={sale.id} className="bg-white p-8 rounded-sm border border-j-border shadow-sm group hover:border-jumia-orange/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-j-background rounded-sm border border-j-border flex items-center justify-center text-j-text-muted group-hover:text-jumia-orange group-hover:border-jumia-orange/30 transition-all shadow-inner">
                          <Box size={20} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-j-text uppercase tracking-tight leading-none mb-1">{sale.variant.product.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-j-text-muted uppercase tracking-widest opacity-60">
                            <span className="flex items-center gap-1"><Fingerprint size={10} /> {sale.variant.sku}</span>
                            <span className="flex items-center gap-1"><Target size={10} /> {sale.variant.product.seller.businessName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-j-border">
                        <div>
                          <p className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40 mb-1">Sale Price</p>
                          <div className="text-j-text font-black text-sm tracking-tight">
                            ₦{Number(sale.salePrice).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40 mb-1">Sales Progress</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-j-background rounded-full overflow-hidden border border-j-border max-w-[100px]">
                              <div className="h-full bg-jumia-orange" style={{ width: `${Math.min((sale.qtySold / sale.qtyLimit) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-j-text tracking-widest">{sale.qtySold}/{sale.qtyLimit}</span>
                          </div>
                        </div>
                        <div className="md:col-span-1 col-span-2">
                          <p className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40 mb-1">Campaign Period</p>
                          <div className="text-j-text-muted font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                            <Clock size={10} />
                            {new Date(sale.startTime).toLocaleDateString()} - {new Date(sale.endTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteFlashSaleMutation.mutate({ id: sale.id })}
                        disabled={deleteFlashSaleMutation.isPending}
                        className="bg-red-50 text-j-error hover:bg-j-error hover:text-white border border-red-100 p-3 rounded-sm duration-300 transition-all shadow-sm disabled:opacity-50"
                        title="Delete Campaign"
                      >
                        <Trash size={18} />
                      </button>
                      <button className="p-3 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-j-text hover:text-j-text transition-all shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!flashSales || flashSales.length === 0) && (
                <div className="bg-white p-24 rounded-sm border border-j-border text-center space-y-4 opacity-20">
                  <TrendingUp size={48} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active campaigns</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

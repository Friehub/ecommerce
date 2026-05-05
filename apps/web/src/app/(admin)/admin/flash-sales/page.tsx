'use client';

import { useState } from 'react';
import { api } from '../../../../trpc/react';
import { ShieldCheck, Calendar, DollarSign, Trash, Plus } from 'lucide-react';

export default function AdminFlashSalesPage() {
  const utils = api.useUtils();
  const [variantSearch, setVariantSearch] = useState('');
  const { data: flashSales, isLoading: loadingSales } = api.admin.listFlashSales.useQuery();
  const { data: variants, isLoading: loadingVariants } = api.admin.listAllVariants.useQuery(
    variantSearch ? { search: variantSearch } : undefined
  );

  const createFlashSaleMutation = api.admin.createFlashSale.useMutation({
    onSuccess: () => {
      utils.admin.listFlashSales.invalidate();
      setVariantId('');
      setSalePrice('');
      setQtyLimit('');
      setStartTime('');
      setEndTime('');
      alert('Flash Sale created successfully!');
    },
    onError: (err) => {
      alert('Error creating flash sale: ' + err.message);
    }
  });

  const deleteFlashSaleMutation = api.admin.deleteFlashSale.useMutation({
    onSuccess: () => {
      utils.admin.listFlashSales.invalidate();
      alert('Flash Sale deleted!');
    }
  });

  const [variantId, setVariantId] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [qtyLimit, setQtyLimit] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantId || !salePrice || !qtyLimit || !startTime || !endTime) {
      alert('Please fill out all fields');
      return;
    }

    const selectedVariant = variants?.find(v => v.id === variantId);
    if (!selectedVariant) {
      alert('Selected variant not found');
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

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-[#f68b1e]" /> Admin Flash Sales Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Create, view, and delete platform flash sales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Flash Sale Form */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="text-[#f68b1e]" /> Create Flash Sale
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Search & Select Variant
              </label>
              <input
                type="text"
                placeholder="Search variant or SKU..."
                value={variantSearch}
                onChange={(e) => setVariantSearch(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white mb-2"
              />
              <select
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                required
              >
                <option value="">Choose variant</option>
                {variants?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.product.title} - {v.sku} (₦{Number(v.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Sale Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Limit Quantity
                </label>
                <input
                  type="number"
                  value={qtyLimit}
                  onChange={(e) => setQtyLimit(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={createFlashSaleMutation.isLoading}
              className="w-full bg-[#f68b1e] text-white py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#e07b12] transition disabled:opacity-50"
            >
              {createFlashSaleMutation.isLoading ? 'Creating...' : 'Create Flash Sale'}
            </button>
          </form>
        </div>

        {/* List of Flash Sales */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Active & Upcoming Flash Sales</h3>
            <span className="bg-[#f68b1e] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {flashSales?.length || 0}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {flashSales?.map((sale) => (
              <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900">{sale.variant.product.title}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    SKU: {sale.variant.sku} • Seller: {sale.variant.product.seller.businessName}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-700">
                    <span className="flex items-center gap-1 font-bold">
                      <DollarSign size={14} className="text-[#f68b1e]" />
                      ₦{Number(sale.salePrice).toLocaleString()}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                      Limit: {sale.qtySold} / {sale.qtyLimit} sold
                    </span>
                    <span className="flex items-center gap-1 text-[10px] uppercase text-gray-500">
                      <Calendar size={12} />
                      {new Date(sale.startTime).toLocaleString()} - {new Date(sale.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteFlashSaleMutation.mutate({ id: sale.id })}
                  disabled={deleteFlashSaleMutation.isLoading}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Trash size={14} /> Delete
                </button>
              </div>
            ))}
            {(!flashSales || flashSales.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                No flash sales scheduled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { api } from '@/trpc/react';
import { 
  Plus, 
  Search, 
  Package, 
  Eye,
  Edit2,
  Trash2,
  Star,
  Filter,
  ArrowRight,
  Sparkles,
  Box,
  MoreVertical,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { ProductStatusBadge } from '@/components/ui/ProductStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SellerInventory() {
  const { data: products, isLoading } = api.seller.listMyProducts.useQuery();
  const utils = api.useUtils();
  const { toast } = useToast();
  
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const deleteProduct = api.catalog.deleteProduct.useMutation({
    onSuccess: () => {
      utils.seller.listMyProducts.invalidate();
      toast({
        title: 'Product Removed',
        description: 'Product has been permanently removed from your catalog.',
      });
      setProductToDelete(null);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Could not delete product.',
        variant: 'destructive',
      });
      setProductToDelete(null);
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-[1184px] mx-auto space-y-12 py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-j-border">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-sm" />
            <Skeleton className="h-10 w-96 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-sm" />
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-sm" />
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
                <Package size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-jumia-orange tracking-widest">Stock Management</span>
            </div>
            <h1 className="text-3xl font-black text-j-text uppercase tracking-tight leading-none">
              Stock <span className="text-jumia-orange">Levels</span>
            </h1>
            <p className="text-j-text-muted text-[10px] font-black uppercase mt-2 tracking-widest opacity-60">Monitor variant availability, stock counts, and status indicators</p>
          </div>

          <Link 
            href="/seller/inventory/new"
            className="bg-jumia-orange text-white px-8 py-3 rounded-sm font-black text-[10px] hover:bg-jumia-orange/90 transition-all shadow-md uppercase tracking-widest flex items-center gap-3 group"
          >
            <Plus size={16} className="group-hover:scale-110 transition-transform" /> 
            Add New Product
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30 group-focus-within:text-jumia-orange transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH BY PRODUCT NAME OR SKU..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-j-border rounded-sm focus:outline-none focus:border-jumia-orange text-[11px] font-black text-j-text placeholder:font-black placeholder:text-j-text-muted/30 transition-all uppercase tracking-widest shadow-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-j-text-muted/30" size={14} />
              <select className="bg-white border border-j-border rounded-sm pl-10 pr-8 py-4 text-[10px] font-black focus:outline-none focus:border-jumia-orange text-j-text appearance-none cursor-pointer uppercase tracking-widest shadow-sm min-w-[200px]">
                <option>ALL CATEGORIES</option>
                <option>ELECTRONICS</option>
                <option>FASHION</option>
                <option>GROCERY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white border border-j-border rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-j-background text-[10px] font-black uppercase text-j-text-muted/50 tracking-widest border-b border-j-border">
                  <th className="px-6 py-5">Product Details</th>
                  <th className="px-6 py-5 text-center">Rating</th>
                  <th className="px-6 py-5">Price (₦)</th>
                  <th className="px-6 py-5 text-center">Stock</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-j-border">
                {products?.map((product) => {
                  const prices = product.variants.map(v => Number(v.price));
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  
                  const totalStock = product.variants.reduce((acc, v) => 
                    acc + v.stockLevels.reduce((sAcc, s) => sAcc + s.qtyOnHand, 0), 0
                  );

                  return (
                    <tr key={product.id} className="hover:bg-j-background transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-j-background rounded-sm border border-j-border flex items-center justify-center relative overflow-hidden group-hover:border-jumia-orange/30 transition-all shadow-inner">
                            {product.media[0] ? (
                              <Image 
                                src={product.media[0].url} 
                                alt={product.title}
                                fill
                                sizes="64px"
                                className="object-contain p-2"
                              />
                            ) : (
                              <Package size={24} className="text-j-text-muted/20" />
                            )}
                          </div>
                          <div className="max-w-[320px]">
                            <div className="font-black text-xs text-j-text uppercase tracking-tight group-hover:text-jumia-orange transition-colors duration-300 truncate mb-1">
                              {product.title}
                            </div>
                            <div className="flex items-center gap-2">
                              {product.isExpress && (
                                <span className="text-[8px] font-black text-jumia-orange uppercase tracking-widest bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-sm">
                                  Jumia Express
                                </span>
                              )}
                              <span className="text-[8px] font-black text-j-text-muted/40 uppercase tracking-widest">ID: {product.id.slice(-8).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5">
                            <Star size={14} className="fill-jumia-orange text-jumia-orange" />
                            <span className="text-xs font-black text-j-text">{Number(product.averageRating || 0).toFixed(1)}</span>
                          </div>
                          <span className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40">
                            {product.reviewCount || 0} REVIEWS
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-black text-j-text tracking-tight">
                          ₦{minPrice.toLocaleString()} {maxPrice > minPrice && ` - ₦${maxPrice.toLocaleString()}`}
                        </div>
                        <div className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40 mt-1">Current Price</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="space-y-1">
                          <div className={`text-sm font-black tracking-tight ${totalStock > 0 ? 'text-j-text' : 'text-j-error'}`}>
                            {totalStock.toLocaleString()}
                          </div>
                          <div className="text-[8px] font-black text-j-text-muted uppercase tracking-widest opacity-40">
                            {product.variants.length} VARIANTS
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-all ${
                          product.status === 'ACTIVE' 
                            ? 'bg-green-50 text-j-success border-green-100' 
                            : 'bg-j-background text-j-text-muted border-j-border'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${product.status === 'ACTIVE' ? 'bg-j-success animate-pulse' : 'bg-j-text-muted/30'}`} />
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-j-text hover:text-j-text transition-all shadow-sm">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 bg-white text-j-text-muted border border-j-border rounded-sm hover:border-jumia-orange hover:text-jumia-orange transition-all shadow-sm">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setProductToDelete(product.id)}
                            className="p-2 bg-red-50 text-j-error border border-red-100 rounded-sm hover:bg-j-error hover:text-white transition-all shadow-sm"
                            disabled={deleteProduct.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 max-w-sm mx-auto opacity-20">
                        <Package size={48} />
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-j-text uppercase tracking-tight">No Products Found</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest">Start adding products to your catalog to see them here.</p>
                        </div>
                        <Link 
                          href="/seller/inventory/new" 
                          className="bg-jumia-orange text-white px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest shadow-md flex items-center gap-2 group"
                        >
                          Add Your First Product
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!productToDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action will remove all variants and stock data. This cannot be undone."
        onConfirm={() => productToDelete && deleteProduct.mutate({ id: productToDelete })}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

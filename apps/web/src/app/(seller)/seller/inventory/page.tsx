'use client';

import { api } from '@/trpc/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Package, 
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function SellerInventory() {
  const utils = api.useUtils();
  const deleteProduct = api.catalog.deleteProduct.useMutation({
    onSuccess: () => {
      utils.seller.listMyProducts.invalidate();
      alert('Product deleted successfully');
    },
    onError: (err) => {
      alert(err.message || 'Failed to delete product');
    }
  });

  if (isLoading) return <div className="text-gray-400">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Product Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product listings and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-white border border-gray-200 rounded pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#f68b1e] w-64 shadow-sm"
            />
          </div>
          <Link 
            href="/seller/inventory/new"
            className="bg-[#f68b1e] text-white px-4 py-2 rounded font-bold text-sm hover:bg-[#e67e17] transition-all shadow-sm flex items-center gap-2 uppercase"
          >
            <Plus size={18} />
            Add New Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">Category / Brand</th>
              <th className="px-6 py-4">Price Range</th>
              <th className="px-6 py-4">Total Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((product) => {
              const prices = product.variants.map(v => Number(v.price));
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const totalStock = product.variants.reduce((acc, v) => 
                acc + v.stockLevels.reduce((sAcc, s) => sAcc + s.qtyOnHand, 0), 0
              );

              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center border border-gray-100 shrink-0">
                        {product.media[0] ? (
                          <img src={product.media[0].url} alt="" className="w-full h-full object-cover rounded" />
                        ) : (
                          <Package size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="max-w-[240px] truncate">
                        <div className="text-sm font-bold text-gray-900">{product.title}</div>
                        <div className="text-gray-400 text-[10px] mt-1">ID: {product.id.slice(-8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-gray-600 text-xs font-medium">{product.category.name}</div>
                    <div className="text-gray-400 text-[10px] mt-0.5">{product.brand.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-gray-900">
                      ₦{minPrice.toLocaleString()} {maxPrice > minPrice && ` - ₦${maxPrice.toLocaleString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-xs font-bold ${totalStock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                      {totalStock} units
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      product.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-orange-600 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProduct.mutate({ id: product.id });
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-all"
                        disabled={deleteProduct.isLoading}
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
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={32} strokeWidth={1} />
                    <p className="text-xs uppercase font-bold tracking-wider">No products in your inventory</p>
                    <Link href="/seller/inventory/new" className="text-[#f68b1e] text-xs font-bold hover:underline mt-2">
                      Upload your first product
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

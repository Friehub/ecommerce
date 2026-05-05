'use client';

import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Tag, ChevronRight, UploadCloud } from 'lucide-react';
import { api } from '../../../../trpc/react';

export default function SellerProductsHubPage() {
  const [csvContent, setCsvContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const bulkImportMutation = api.catalog.bulkImport.useMutation({
    onSuccess: (data) => {
      setUploadStatus(`Success! CSV file processed and products queued for background worker. Job ID: ${data.jobId}`);
      setCsvContent('');
    },
    onError: (err) => {
      setUploadStatus(`Error queueing job: ${err.message}`);
    }
  });

  const [products, setProducts] = useState([
    { id: '1', title: 'Corporate Premium Leather Briefcase', sku: 'CORP-LEA-BRF', category: 'Fashion', price: 45000, stock: 124, status: 'ACTIVE' },
    { id: '2', title: 'Tactical Utility Outdoor Backpack', sku: 'TACT-UTL-BPK', category: 'Fashion', price: 18500, stock: 89, status: 'ACTIVE' },
    { id: '3', title: 'Modern Premium Ergonomic Desk Chair', sku: 'MOD-ERG-CHAIR', category: 'Home & Office', price: 62000, status: 'DRAFT', stock: 0 },
  ]);

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleBulkImport = () => {
    if (!csvContent) return;
    setUploadStatus('Uploading CSV and submitting import job to task queue...');
    bulkImportMutation.mutate({ csvContent });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none bg-[#F9F9FA] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
            <Package className="text-[#F68B1E]" /> PRODUCT CATALOG MANAGEMENT
          </h1>
          <p className="text-gray-500 text-xs font-medium tracking-wide mt-1">
            Create, manage, and edit multi-vendor inventory listings and product options.
          </p>
        </div>
        <button className="bg-[#F68B1E] hover:bg-[#e07a1a] text-white px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer border border-transparent select-none w-full sm:w-auto justify-center">
          <Plus size={16} /> ADD NEW PRODUCT
        </button>
      </div>

      {/* Bulk Upload CSV Section */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase flex items-center gap-2">
          <UploadCloud className="text-[#F68B1E]" size={18} /> BULK CSV PRODUCT UPLOAD
        </h2>
        <p className="text-gray-500 text-xs font-medium tracking-wide">
          Upload products via a comma-separated file (.csv). Expected format columns: <code className="bg-gray-100 text-[#F68B1E] px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">title,sku,price,description,comparePrice,ean,stock,brandId,categoryId</code>
        </p>

        <div className="space-y-3">
          <textarea
            placeholder="Paste your CSV file contents here..."
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#F68B1E] text-xs font-mono text-gray-900 placeholder-gray-400 transition-all duration-200"
          />

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={handleBulkImport}
              disabled={!csvContent || bulkImportMutation.isPending}
              className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer border border-transparent select-none w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkImportMutation.isPending ? 'Processing Import...' : 'Import Products CSV'}
            </button>
            {uploadStatus && (
              <span className={`text-xs font-bold ${uploadStatus.startsWith('Success') ? 'text-green-600' : 'text-orange-600'}`}>
                {uploadStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100/80 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/40">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by SKU, item title, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#F68B1E] text-xs font-bold text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
            />
          </div>
          <select className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-[#F68B1E] text-gray-600 shadow-sm w-full sm:w-auto">
            <option>All Statuses</option>
            <option>ACTIVE</option>
            <option>DRAFT</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Item Detail / Catalog Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/40 duration-200 transition-all select-none">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-xs md:text-sm text-gray-900 leading-tight tracking-tight hover:text-[#F68B1E] transition-colors duration-200 cursor-pointer">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} className="text-gray-300" /> SKU: {item.sku}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-extrabold text-[#264996] uppercase tracking-wider bg-blue-50/50 border border-blue-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-gray-900">₦ {item.price.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border uppercase tracking-wider ${
                      item.stock > 0 ? 'bg-green-50 text-green-700 border-green-100/60' : 'bg-orange-50 text-orange-600 border-orange-100/60'
                    }`}>
                      {item.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-500 bg-gray-50 border border-gray-100/80 hover:bg-gray-100 hover:text-[#F68B1E] rounded-xl duration-200 transition-all cursor-pointer">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 bg-red-50 border border-red-100/80 hover:bg-red-100 hover:text-red-700 rounded-xl duration-200 transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

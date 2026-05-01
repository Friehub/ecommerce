'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  ChevronRight,
  Package,
  Info,
  DollarSign,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function NewProduct() {
  const router = useRouter();
  const utils = api.useContext();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    brandId: '',
    images: [] as { url: string; key: string }[],
    variants: [
      { sku: '', price: 0, comparePrice: 0, stock: 10, attributes: {} }
    ]
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });
      
      const { uploadUrl, publicUrl, key } = await res.json();
      
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: publicUrl, key }]
      }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const { data: categories } = api.catalog.getCategories.useQuery();
  const { data: brands } = api.catalog.getBrands.useQuery();
  
  const createProduct = api.catalog.createProduct.useMutation({
    onSuccess: () => {
      utils.seller.listMyProducts.invalidate();
      router.push('/seller/inventory');
    }
  });

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sku: '', price: 0, comparePrice: 0, stock: 10, attributes: {} }]
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length === 1) return;
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      createProduct.mutate({
        title: formData.title,
        description: formData.description,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        images: formData.images.map(img => img.url),
        variants: formData.variants.map(v => ({
          sku: v.sku,
          price: Number(v.price),
          comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
          attributes: v.attributes,
          weightGrams: 500, // Default weight
          stock: v.stock
        }))
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/seller/inventory" className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Create New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below to list your product on Jumia.</p>
        </div>
      </div>

      <div className="flex gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step >= s ? 'bg-[#f68b1e] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              step >= s ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {s === 1 ? 'Basic Details' : 'Pricing & Inventory'}
            </span>
            {s < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="bg-white p-8 rounded shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Info size={18} className="text-[#f68b1e]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Product Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Product Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#f68b1e] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                  <select 
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#f68b1e] transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Brand</label>
                  <select 
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#f68b1e] transition-all"
                  >
                    <option value="">Select Brand</option>
                    {brands?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Description</label>
                <textarea 
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your product..."
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-[#f68b1e] transition-all"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Product Images</label>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Up to 5 images</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((img, i) => (
                    <div key={i} className="aspect-square bg-gray-50 rounded border border-gray-100 relative group overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="aspect-square bg-gray-50 rounded border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#f68b1e] hover:bg-orange-50/30 transition-all group">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#f68b1e]" />
                      ) : (
                        <>
                          <Plus size={20} className="text-gray-400 group-hover:text-[#f68b1e]" />
                          <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-[#f68b1e]">Upload</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-8 rounded shadow-sm border border-gray-200 space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <DollarSign size={18} className="text-[#f68b1e]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Variants & Pricing</h2>
            </div>

            <div className="space-y-6">
              {formData.variants.map((variant, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded border border-gray-100 space-y-4 relative group">
                  {formData.variants.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">SKU</label>
                      <input 
                        required
                        value={variant.sku}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].sku = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        placeholder="e.g. S24-BLACK-256"
                        className="w-full bg-white border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#f68b1e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Price (₦)</label>
                      <input 
                        required
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].price = Number(e.target.value);
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full bg-white border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#f68b1e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Compare Price (₦)</label>
                      <input 
                        type="number"
                        value={variant.comparePrice}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].comparePrice = Number(e.target.value);
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full bg-white border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#f68b1e]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Stock Units</label>
                      <input 
                        required
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].stock = Number(e.target.value);
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full bg-white border border-gray-200 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#f68b1e]"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                onClick={handleAddVariant}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded flex items-center justify-center gap-2 text-gray-400 hover:text-[#f68b1e] hover:border-[#f68b1e] transition-all text-xs font-bold uppercase tracking-widest"
              >
                <Plus size={16} />
                Add Another Variant
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          {step > 1 ? (
            <button 
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-8 py-3 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded transition-all uppercase"
            >
              Back
            </button>
          ) : <div />}
          
          <button 
            type="submit"
            disabled={createProduct.isLoading}
            className="bg-[#f68b1e] text-white px-12 py-3 rounded font-bold text-sm hover:bg-[#e67e17] transition-all shadow-sm uppercase disabled:opacity-50"
          >
            {createProduct.isLoading ? 'Processing...' : step === 1 ? 'Next: Pricing' : 'Submit Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}

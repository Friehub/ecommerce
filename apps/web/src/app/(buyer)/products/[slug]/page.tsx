import { api } from '@/trpc/server';
import { notFound } from "next/navigation";
import { ProductGallery } from "../../../../components/products/ProductGallery";
import { ProductActions } from "../../../../components/products/ProductActions";
import { ChevronRight, Star, Share2 } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await api.catalog.getProductBySlug.query({ slug });

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-[#F9F9FA] min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 select-none">
        <div className="container py-3.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
          <a href="/" className="hover:text-[#F68B1E] transition-colors">Home</a>
          <ChevronRight size={14} className="text-gray-300" />
          <a href={`/category/${product.category.slug}`} className="hover:text-[#F68B1E] transition-colors">{product.category.name}</a>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-bold truncate max-w-[200px] md:max-w-none">{product.title}</span>
        </div>
      </div>

      <main className="container py-6">
        <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md overflow-hidden">
          <div className="flex flex-col lg:flex-row p-5 lg:p-7 gap-8">
            {/* Left: Gallery */}
            <div className="w-full lg:w-2/5">
              <ProductGallery images={product.media} />
            </div>

            {/* Right: Info & Actions */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <span className="bg-orange-50/80 border border-orange-100 text-[#F68B1E] text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wide">
                      Official Store
                    </span>
                    <p className="text-xs text-[#264996] font-extrabold hover:underline cursor-pointer tracking-tight">{product.brand.name}</p>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    {product.title}
                  </h1>
                </div>
                <button className="p-2.5 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-full transition-all duration-200 cursor-pointer group">
                  <Share2 size={18} className="text-gray-500 group-hover:text-[#F68B1E]" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-5 select-none">
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} className={i < 4 ? "text-orange-400" : "text-gray-200"} />
                  ))}
                </div>
                <span className="text-xs text-[#264996] font-semibold hover:underline cursor-pointer">(124 ratings)</span>
              </div>

              <ProductActions product={product} />
            </div>

            {/* Far Right: Delivery & Seller (Desktop Only) */}
            <div className="w-full lg:w-[280px] hidden lg:block space-y-4 select-none">
              <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-3 tracking-wide">Delivery & Returns</h4>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <div className="text-[#F68B1E] bg-orange-50 p-2 rounded-lg border border-orange-100/50">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-800">Lagos, Ikeja</p>
                      <p className="text-[10px] font-medium text-[#F68B1E] cursor-pointer hover:underline">Change location</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 border border-blue-100/60 p-3 rounded-lg text-[11px] text-[#264996] font-medium leading-relaxed">
                    <strong className="text-blue-900 font-bold">Free Delivery</strong> on your first order with Jumia Express.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                <h4 className="text-xs font-extrabold uppercase text-gray-400 mb-3 tracking-wide">Seller Information</h4>
                <div className="space-y-1 pb-2">
                  <p className="text-sm font-extrabold text-gray-800">{product.seller.businessName || "Jumia Store"}</p>
                  <p className="text-[10px] font-medium text-green-600">85% Seller Score</p>
                  <p className="text-[10px] font-medium text-gray-500">2,345 Followers</p>
                </div>
                <button className="w-full mt-3 text-[#F68B1E] border border-orange-100 hover:border-[#F68B1E] bg-orange-50/30 hover:bg-[#F68B1E] hover:text-white py-2 rounded-lg text-xs font-extrabold uppercase transition-all tracking-wide select-none">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-4 border-b border-gray-100 pb-2 text-gray-900">Product Details</h3>
          <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed whitespace-pre-wrap select-none">
            {product.description}
          </div>
        </div>

        {/* Specifications Section */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-md p-5 lg:p-7">
          <h3 className="text-lg font-extrabold mb-4 border-b border-gray-100 pb-2 text-gray-900">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 select-none">
            {Object.entries(product.variants[0]?.attributes || {}).map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-50 py-2.5 text-sm">
                <span className="font-bold text-gray-500 w-1/3 capitalize tracking-tight">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-gray-800 font-semibold">{value as string}</span>
              </div>
            ))}
            <div className="flex border-b border-gray-50 py-2.5 text-sm">
              <span className="font-bold text-gray-500 w-1/3 tracking-tight">Weight (g)</span>
              <span className="text-gray-800 font-semibold">{product.variants[0]?.weightGrams || "N/A"}</span>
            </div>
            <div className="flex border-b border-gray-50 py-2.5 text-sm">
              <span className="font-bold text-gray-500 w-1/3 tracking-tight">SKU</span>
              <span className="text-gray-800 uppercase font-bold text-xs">{product.variants[0]?.sku}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

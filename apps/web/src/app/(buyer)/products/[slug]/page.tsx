import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductActions } from "@/components/products/ProductActions";
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
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container py-3 flex items-center gap-2 text-xs text-gray-500">
          <a href="/" className="hover:text-[#F68B1E]">Home</a>
          <ChevronRight size={14} />
          <a href={`/category/${product.category.slug}`} className="hover:text-[#F68B1E]">{product.category.name}</a>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">{product.title}</span>
        </div>
      </div>

      <main className="container py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-8">
            {/* Left: Gallery */}
            <div className="w-full lg:w-2/5">
              <ProductGallery images={product.media} />
            </div>

            {/* Right: Info & Actions */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#F68B1E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Official Store</span>
                    <p className="text-xs text-[#264996] font-bold hover:underline cursor-pointer">{product.brand.name}</p>
                  </div>
                  <h1 className="text-xl md:text-2xl font-medium text-gray-800 leading-tight">
                    {product.title}
                  </h1>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Share2 size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 border-b pb-4">
                <div className="flex text-[#F68B1E]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-[#264996] hover:underline cursor-pointer">(124 ratings)</span>
              </div>

              <ProductActions product={product} />
            </div>

            {/* Far Right: Delivery & Seller (Desktop Only) */}
            <div className="w-full lg:w-[280px] hidden lg:block space-y-4">
              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Delivery & Returns</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="text-[#F68B1E]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Lagos, Ikeja</p>
                      <p className="text-[10px] text-gray-500">Change location</p>
                    </div>
                  </div>
                  <div className="bg-[#E7F0FF] p-2 rounded text-[10px] text-[#264996]">
                    <strong>Free Delivery</strong> on your first order with Jumia Express.
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Seller Information</h4>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{product.seller.name || "Jumia Store"}</p>
                  <p className="text-[10px] text-gray-500">85% Seller Score</p>
                  <p className="text-[10px] text-gray-500">2,345 Followers</p>
                </div>
                <button className="w-full mt-3 text-[#F68B1E] border border-[#F68B1E] py-1.5 rounded text-xs font-bold uppercase hover:bg-[#F68B1E]/5 transition-all">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Product Details</h3>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </div>
        </div>

        {/* Specifications Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 lg:p-6">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {Object.entries(product.variants[0]?.attributes || {}).map(([key, value]) => (
              <div key={key} className="flex border-b py-2 text-sm">
                <span className="font-medium text-gray-500 w-1/3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-gray-800">{value as string}</span>
              </div>
            ))}
            <div className="flex border-b py-2 text-sm">
              <span className="font-medium text-gray-500 w-1/3">Weight (g)</span>
              <span className="text-gray-800">{product.variants[0]?.weightGrams || "N/A"}</span>
            </div>
            <div className="flex border-b py-2 text-sm">
              <span className="font-medium text-gray-500 w-1/3">SKU</span>
              <span className="text-gray-800 uppercase text-xs">{product.variants[0]?.sku}</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

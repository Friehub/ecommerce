import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductActions } from "@/components/products/ProductActions";
import { ChevronRight, Star, Share2 } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await api.catalog.getProductBySlug({ slug: params.slug });

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

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .gap-8 { gap: 32px; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 768px) {
          .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lg\:flex-row { flex-direction: row; }
          .lg\:w-2\/5 { width: 40%; }
          .lg\:w-\[280px\] { width: 280px; }
          .lg\:block { display: block; }
          .lg\:p-6 { padding: 1.5rem; }
        }
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-\[#F68B1E\] { background-color: #f68b1e; }
        .bg-\[#E7F0FF\] { background-color: #e7f0ff; }
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .border { border: 1px solid #e5e7eb; }
        .rounded { border-radius: 4px; }
        .rounded-lg { border-radius: 8px; }
        .rounded-full { border-radius: 9999px; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .p-2 { padding: 0.5rem; }
        .p-4 { padding: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-700 { color: #374151; }
        .text-gray-500 { color: #6b7280; }
        .text-\[#F68B1E\] { color: #f68b1e; }
        .text-\[#264996\] { color: #264996; }
        .uppercase { text-transform: uppercase; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hidden { display: none; }
        .hover\:underline:hover { text-decoration: underline; }
        .hover\:bg-gray-100:hover { background-color: #f3f4f6; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}

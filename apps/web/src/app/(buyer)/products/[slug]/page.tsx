import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await api.catalog.getProduct({ slug: params.slug });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            {product.media[0] ? (
              <img src={product.media[0].url} alt={product.title} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-4">
            {product.media.slice(1).map((m) => (
              <div key={m.id} className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden border">
                <img src={m.url} alt={product.title} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{product.brand.name}</p>
            <h1 className="text-4xl font-bold mt-1">{product.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-orange-500">
              ₦{product.variants[0]?.price.toLocaleString()}
            </span>
            {product.variants[0]?.comparePrice && (
              <span className="text-xl text-gray-400 line-through">
                ₦{product.variants[0]?.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="border-t border-b py-6">
            <h3 className="font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button 
                  key={v.id}
                  className="px-4 py-2 border rounded-md hover:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-all"
                >
                  {Object.values(v.attributes as any).join(" / ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors">
              Add to Cart
            </button>
            <button className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

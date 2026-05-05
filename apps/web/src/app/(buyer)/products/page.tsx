import { api } from "../../../trpc/server";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const { results: products } = await api.catalog.listProducts.query({
    categoryId: sp.category,
    brandId: sp.brand,
    search: sp.q,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.media[0] ? (
                <img src={product.media[0].url} alt={product.title} className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-sm">No Image</span>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-lg truncate">{product.title}</h2>
              <p className="text-orange-500 font-bold mt-1">
                ₦{product.variants[0]?.price.toLocaleString()}
              </p>
              <a 
                href={`/products/${product.slug}`}
                className="mt-4 block text-center bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

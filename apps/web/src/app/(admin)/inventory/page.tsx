import { prisma } from "@ecom/db";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const stockLevels = await prisma.stockLevel.findMany({
    include: {
      variant: {
        include: {
          product: true,
        },
      },
      warehouse: true,
    },
    orderBy: {
      qtyOnHand: "asc",
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Hand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockLevels.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stock.variant.product.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.variant.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.warehouse.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {stock.qtyOnHand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.qtyReserved}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {stock.qtyOnHand <= 10 ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

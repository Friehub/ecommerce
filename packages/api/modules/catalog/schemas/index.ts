import { z } from 'zod'

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be at least 0"),
  comparePrice: z.number().min(0).optional(),
  attributes: z.record(z.any()).optional().default({}),
  weightGrams: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional().default(0),
})

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
})

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  commissionRate: z.number().min(0).max(100),
  attributeSchema: z.record(z.any()).optional(),
})

export const updateProductSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'DELETED']).optional()
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

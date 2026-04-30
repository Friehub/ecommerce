import { z } from 'zod'

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  attributes: z.record(z.any()),
  weightGrams: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional().default(0),
})

export const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  brandId: z.string(),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1),
})

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  commissionRate: z.number().min(0).max(100),
  attributeSchema: z.record(z.any()).optional(),
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>
export type CategoryInput = z.infer<typeof categorySchema>

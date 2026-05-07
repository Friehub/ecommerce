import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  streetAddress: z.string().min(1),
  landmark: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1).default('Nigeria'),
  addressType: z.enum(['HOME', 'OFFICE']).default('HOME'),
  isDefault: z.boolean().default(false),
})

export const sellerOnboardingSchema = z.object({
  businessName: z.string().min(2),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type SellerOnboardingInput = z.infer<typeof sellerOnboardingSchema>

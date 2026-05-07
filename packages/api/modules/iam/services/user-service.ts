import { prisma } from '@ecom/db'
import bcrypt from 'bcryptjs'
import { publishEvent } from '@ecom/shared'
import type { RegisterInput, AddressInput, SellerOnboardingInput } from '../schemas/index.js'
import type { Service } from '../../../types.js'

export const userService: Service = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { addresses: true, sellerProfile: true },
    })
  },

  async register({ email, password, firstName, lastName, phone, role }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('EMAIL_IN_USE')

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone, role },
    })

    await publishEvent('user.created', { userId: user.id, email: user.email, role })
    return user
  },

  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return null

    // E07: Check isActive BEFORE expensive bcrypt to prevent timing oracle
    // Return null instead of throwing to avoid leaking account status
    if (!user.isActive) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null

    return user
  },

  async addAddress(userId: string, data: AddressInput) {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        })
      }
      return tx.userAddress.create({ data: { ...data, userId } as any })
    });
  },

  async getAddresses(userId: string) {
    return prisma.userAddress.findMany({ where: { userId } })
  },

  async deleteAddress(id: string, userId: string) {
    return prisma.userAddress.deleteMany({ where: { id, userId } })
  },

  async updateProfile(id: string, data: { firstName: string; lastName: string; phone?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
}

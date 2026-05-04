import { prisma } from '@ecom/db'
import bcrypt from 'bcryptjs'
import { publishEvent } from '@ecom/shared'
import type { RegisterInput, AddressInput, SellerOnboardingInput } from '../schemas'

const UserSafeSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ 
      where: { email },
      select: { ...UserSafeSelect, passwordHash: true } // Internal use often needs hash
    })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        ...UserSafeSelect,
        addresses: true,
        sellerProfile: true,
      }
    })
  },

  async register({ email, password, firstName, lastName, phone, role }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('EMAIL_IN_USE')

    const passwordHash = await bcrypt.hash(password, 12)

    // Production-grade random token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        firstName, 
        lastName, 
        phone, 
        role,
        verificationToken,
        isActive: role === 'ADMIN' // Auto-activate admins
      },
      select: UserSafeSelect
    })

    await publishEvent('user.created', { userId: user.id, email: user.email, role })
    return user
  },

  async validateCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return null

    if (!user.isActive) throw new Error('ACCOUNT_SUSPENDED')

    // Return sanitized user
    const { passwordHash: _, verificationToken: __, ...safeUser } = user;
    return safeUser;
  },

  async addAddress(userId: string, data: AddressInput) {
    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.userAddress.create({ data: { ...data, userId } as any });
    });
  },

  async getAddresses(userId: string) {
    return prisma.userAddress.findMany({ where: { userId } })
  },

  async deleteAddress(id: string, userId: string) {
    return prisma.userAddress.deleteMany({ where: { id, userId } })
  },

  async verifyAccount(token: string) {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) throw new Error('INVALID_TOKEN');

    return prisma.user.update({
      where: { id: user.id },
      data: { 
        isActive: true,
        verificationToken: null 
      },
      select: UserSafeSelect
    });
  },
}

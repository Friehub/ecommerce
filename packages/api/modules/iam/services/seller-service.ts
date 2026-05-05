import { prisma } from '@ecom/db'
import type { Service } from '../../../types'

export const sellerService: Service = {
  async onboard(userId: string, data: { businessName: string }) {
    const existing = await prisma.seller.findUnique({ where: { userId } })
    if (existing) throw new Error('SELLER_PROFILE_EXISTS')

    return prisma.seller.create({
      data: {
        userId,
        businessName: data.businessName,
        status: 'PENDING_VERIFICATION',
      },
    })
  },

  async uploadDocument(sellerId: string, doc: { type: string; url: string }) {
    return prisma.sellerDocument.create({
      data: {
        sellerId,
        type: doc.type,
        url: doc.url,
        status: 'PENDING',
      },
    })
  },

  async getProfile(userId: string) {
    return prisma.seller.findUnique({
      where: { userId },
      include: { documents: true },
    })
  },
}

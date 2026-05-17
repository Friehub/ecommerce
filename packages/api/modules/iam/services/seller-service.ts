import { prisma } from '@ecom/db'

const sellerDocumentService = prisma.sellerDocument;

export const sellerService = {
  // Prisma delegates
  findUnique: prisma.seller.findUnique,
  findFirst: prisma.seller.findFirst,
  findMany: prisma.seller.findMany,
  create: prisma.seller.create,
  update: prisma.seller.update,
  delete: prisma.seller.delete,
  count: prisma.seller.count,
  aggregate: prisma.seller.aggregate,
  groupBy: prisma.seller.groupBy,
  updateMany: prisma.seller.updateMany,
  deleteMany: prisma.seller.deleteMany,
  upsert: prisma.seller.upsert,
  async onboard(userId: string, data: { businessName: string }) {
    const existing = await sellerService.findUnique({ where: { userId } })
    if (existing) throw new Error('SELLER_PROFILE_EXISTS')

    return sellerService.create({
      data: {
        userId,
        businessName: data.businessName,
        status: 'PENDING_VERIFICATION',
      },
    })
  },

  async uploadDocument(sellerId: string, doc: { type: string; url: string }) {
    return sellerDocumentService.create({
      data: {
        sellerId,
        type: doc.type,
        url: doc.url,
        status: 'PENDING',
      },
    })
  },

  async getProfile(userId: string) {
    return sellerService.findUnique({
      where: { userId },
      include: { documents: true },
    })
  },

  async setupPayoutAccount(userId: string, data: { bankCode: string, bankAccountNumber: string, bankAccountName: string }) {
    const seller = await sellerService.findUnique({ where: { userId } });
    if (!seller) throw new Error('SELLER_NOT_FOUND');

    const { paymentService } = await import('../../payment/services/payment-service.js');
    return await paymentService.setupPayoutAccount(seller.id, {
      bankCode: data.bankCode,
      accountNumber: data.bankAccountNumber,
      accountName: data.bankAccountName,
    });
  },

  async getPublicProfile(idOrSlug: string) {
    const seller = await sellerService.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { businessName: { equals: idOrSlug, mode: 'insensitive' } }
        ],
        status: 'ACTIVE'
      },
      select: {
        id: true,
        businessName: true,
        status: true,
        tier: true,
        createdAt: true,
        rating: true,
        _count: {
          select: { products: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    if (!seller) throw new Error('SELLER_NOT_FOUND');

    return {
      ...seller,
      memberSince: seller.createdAt,
      productCount: seller._count.products,
      rating: seller.rating?.toNumber() || 0
    };
  }
}

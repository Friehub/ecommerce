import { prisma } from '@ecom/db'
import type { Service } from '../../../types.js'

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

  async setupPayoutAccount(userId: string, data: { bankCode: string, bankAccountNumber: string, bankAccountName: string }) {
    const seller = await prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new Error('SELLER_NOT_FOUND');

    const { config } = await import('../../../config.js');
    const PAYSTACK_SECRET_KEY = config.PAYSTACK_SECRET_KEY;

    let recipientCode = `SIM_REC_${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Production logic for Paystack Transfer Recipient
    if (PAYSTACK_SECRET_KEY !== 'sk_test_placeholder') {
      try {
        const response = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'nuban',
            name: data.bankAccountName,
            account_number: data.bankAccountNumber,
            bank_code: data.bankCode,
            currency: 'NGN'
          }),
        });

        const result = await response.json();
        if (!result.status) {
          throw new Error(`Paystack Error: ${result.message}`);
        }
        recipientCode = result.data.recipient_code;
      } catch (err: any) {
        console.error('Paystack Transfer Recipient creation failed:', err);
        throw new Error(`FAILED_TO_CREATE_RECIPIENT: ${err.message}`);
      }
    }

    return prisma.seller.update({
      where: { id: seller.id },
      data: {
        bankCode: data.bankCode,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName,
        transferRecipientCode: recipientCode
      }
    });
  },

  async getPublicProfile(idOrSlug: string) {
    const seller = await prisma.seller.findFirst({
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
        averageRating: true,
        reviewCount: true,
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
      rating: seller.averageRating?.toNumber() || 0
    };
  }
}

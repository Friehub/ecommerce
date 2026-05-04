import { prisma } from '@ecom/db';
import { notificationService } from '../../notification/services/notification-service';
import { emailTemplates } from '../../notification/services/email-templates';

export const wishlistService = {
  async addItem(userId: string, variantId: string) {
    return await prisma.$transaction(async (tx) => {
      let wishlist = await tx.wishlist.findUnique({
        where: { userId }
      });

      if (!wishlist) {
        wishlist = await tx.wishlist.create({
          data: { userId }
        });
      }

      return tx.wishlistItem.upsert({
        where: {
          wishlistId_variantId: {
            wishlistId: wishlist.id,
            variantId
          }
        },
        update: {},
        create: {
          wishlistId: wishlist.id,
          variantId
        }
      });
    });
  },

  async removeItem(userId: string, variantId: string) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          variantId
        }
      });
    }
  },

  async getWishlist(userId: string) {
    return prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
  },

  async notifyPriceDrops(variantId: string, oldPrice: number, newPrice: number) {
    const items = await prisma.wishlistItem.findMany({
      where: { variantId },
      include: {
        wishlist: {
          include: {
            user: true
          }
        },
        variant: {
          include: {
            product: true
          }
        }
      }
    });

    // Parallelize notifications for better throughput
    await Promise.allSettled(items.map(async (item) => {
      if (item.wishlist.userId) {
        const productTitle = item.variant.product.title;
        const template = emailTemplates.PRICE_DROP_ALERT({
          productTitle,
          oldPrice,
          newPrice
        });

        await notificationService.sendNotification(
          item.wishlist.userId,
          'PROMOTION',
          template.subject,
          template.html
        );
      }
    }));
  }
};

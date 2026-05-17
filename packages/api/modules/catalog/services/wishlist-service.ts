import { prisma } from '@ecom/db';
import { notificationService } from '../../notification/services/notification-service.js';
import { emailTemplates } from '../../notification/services/email-templates.js';

const wishlistItemService = prisma.wishlistItem;

export const wishlistService = {
  // Prisma delegates
  findUnique: prisma.wishlist.findUnique,
  findFirst: prisma.wishlist.findFirst,
  findMany: prisma.wishlist.findMany,
  create: prisma.wishlist.create,
  update: prisma.wishlist.update,
  delete: prisma.wishlist.delete,
  count: prisma.wishlist.count,
  async addItem(userId: string, variantId: string) {
    let wishlist = await wishlistService.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await wishlistService.create({
        data: { userId }
      });
    }

    return wishlistItemService.upsert({
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
  },

  async removeItem(userId: string, variantId: string) {
    const wishlist = await wishlistService.findUnique({
      where: { userId }
    });

    if (wishlist) {
      await wishlistItemService.deleteMany({
        where: {
          wishlistId: wishlist.id,
          variantId
        }
      });
    }
  },

  async getWishlist(userId: string) {
    return wishlistService.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    media: true
                  }
                }
              }
            }
          }
        }
      }
    });
  },

  async notifyPriceDrops(variantId: string, oldPrice: number, newPrice: number) {
    const items = await wishlistItemService.findMany({
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

    for (const item of items) {
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
    }
  }
};

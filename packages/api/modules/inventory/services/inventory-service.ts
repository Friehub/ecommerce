import { prisma } from '@ecom/db'
import { redis } from '@ecom/shared'
import { RustClient } from '../../../rust-client'

const RESERVE_STOCK_LUA = `
local key = KEYS[1]
local quantity = tonumber(ARGV[1])
local current = tonumber(redis.call('get', key) or "0")

if current >= quantity then
    redis.call('decrby', key, quantity)
    return 1
else
    return 0
end
`;

export const inventoryService = {
  /**
   * Stub for the Rust Inventory Service.
   * Uses Redis DECR for high-concurrency safety during the contest.
   */
  async reserveStock(variantId: string, quantity: number, orderId?: string, userId: string = 'system') {
    // Attempt to use Rust Inventory Service for high-performance atomic reservation
    try {
      const response = await RustClient.inventory.reserve(variantId, quantity, userId);
      if (response && response.reservation_id) {
        // Record reservation in local DB for persistence and sync
        await prisma.stockReservation.create({
          data: {
            id: response.reservation_id,
            variantId,
            orderId,
            quantity,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
            status: 'ACTIVE'
          }
        });
        return true;
      }
    } catch (e) {
      console.warn('Rust inventory service unavailable, falling back to local Redis logic:', e);
    }

    const key = `stock:${variantId}`;
    
    // 1. Check/Set Redis cache if not exists (Lazy load from DB)
    let stock = await redis.get(key);
    if (stock === null) {
      const dbStock = await prisma.stockLevel.aggregate({
        where: { variantId },
        _sum: { qtyOnHand: true, qtyReserved: true }
      });
      const available = (dbStock._sum.qtyOnHand || 0) - (dbStock._sum.qtyReserved || 0);
      await redis.set(key, available, 'EX', 3600);
      stock = available.toString();
    }

    // 2. Atomic decrement
    const result = await redis.eval(RESERVE_STOCK_LUA, 1, key, quantity);
    
    if (result === 1) {
      // 3. Record reservation in DB for persistence
      await prisma.stockReservation.create({
        data: {
          variantId,
          orderId,
          quantity,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
          status: 'ACTIVE'
        }
      });
      return true;
    }

    return false;
  },

  async releaseStock(reservationId: string) {
    const reservation = await prisma.stockReservation.findUnique({
      where: { id: reservationId }
    });
    
    if (!reservation || reservation.status !== 'ACTIVE') return;

    // Return to Redis
    const key = `stock:${reservation.variantId}`;
    await redis.incrby(key, reservation.quantity);

    // Mark in DB
    await prisma.stockReservation.update({
      where: { id: reservationId },
      data: { status: 'RELEASED' }
    });
  },

  async confirmStock(orderId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { orderId, status: 'ACTIVE' }
    });

    for (const res of reservations) {
      // Update persistent qtyOnHand and qtyReserved
      // For the contest, we assume a single warehouse for simplicity
      const stockLevel = await prisma.stockLevel.findFirst({
        where: { variantId: res.variantId }
      });

      if (stockLevel) {
        await prisma.stockLevel.update({
          where: { id: stockLevel.id },
          data: {
            qtyOnHand: { decrement: res.quantity },
            qtyReserved: { decrement: 0 } // Reserved was already deducted from "available" in Redis
          }
        });
      }

      await prisma.stockReservation.update({
        where: { id: res.id },
        data: { status: 'CONFIRMED' }
      });
    }
  },

  async syncStockFromDB(variantId: string) {
    const dbStock = await prisma.stockLevel.aggregate({
      where: { variantId },
      _sum: { qtyOnHand: true, qtyReserved: true }
    });
    const available = (dbStock._sum.qtyOnHand || 0) - (dbStock._sum.qtyReserved || 0);
    await redis.set(`stock:${variantId}`, available);
    return available;
  }
};

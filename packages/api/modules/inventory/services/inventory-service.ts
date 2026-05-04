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
  async reserveStock(variantId: string, quantity: number, orderId?: string, userId: string = 'system', tx?: any) {
    const db = tx || prisma;
    // Attempt to use Rust Inventory Service for high-performance atomic reservation
    try {
      const response = await RustClient.inventory.reserve(variantId, quantity, userId);
      if (response && response.reservation_id) {
        // Record reservation in local DB for persistence and sync
        await db.stockReservation.create({
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
      const [dbStock, activeReservations] = await Promise.all([
        db.stockLevel.aggregate({
          where: { variantId },
          _sum: { qtyOnHand: true }
        }),
        db.stockReservation.aggregate({
          where: { variantId, status: 'ACTIVE' },
          _sum: { quantity: true }
        })
      ]);
      
      const available = (dbStock._sum.qtyOnHand || 0) - (activeReservations._sum.quantity || 0);
      await redis.set(key, available, 'EX', 3600);
      stock = available.toString();
    }

    // 2. Atomic decrement
    const result = await redis.eval(RESERVE_STOCK_LUA, 1, key, quantity);
    
    if (result === 1) {
      // 3. Record reservation in DB for persistence
      await db.stockReservation.create({
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

  async releaseStockByOrderId(orderId: string, tx?: any) {
    const db = tx || prisma;
    const reservations = await db.stockReservation.findMany({
      where: { orderId, status: 'ACTIVE' }
    });

    // 1. Mark in DB (Atomic Batch)
    await db.stockReservation.updateMany({
      where: { id: { in: reservations.map(r => r.id) } },
      data: { status: 'RELEASED' }
    });

    // 2. Return to Redis (Parallel)
    await Promise.all(reservations.map(async (res) => {
      const key = `stock:${res.variantId}`;
      await redis.incrby(key, res.quantity);
    }));
  },

  async confirmStock(orderId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { orderId, status: 'ACTIVE' }
    });

    if (reservations.length === 0) return;

    // 1. Group quantities by variantId to avoid N+1
    const qtyByVariant = reservations.reduce((acc, res) => {
      acc[res.variantId] = (acc[res.variantId] || 0) + res.quantity;
      return acc;
    }, {} as Record<string, number>);

    const variantIds = Object.keys(qtyByVariant);

    await prisma.$transaction(async (tx) => {
      // 2. Batch Update StockLevels
      for (const variantId of variantIds) {
        const qty = qtyByVariant[variantId];
        await tx.stockLevel.updateMany({
          where: { variantId },
          data: {
            qtyOnHand: { decrement: qty }
          }
        });
      }

      // 3. Batch Update Reservations
      await tx.stockReservation.updateMany({
        where: { orderId, status: 'ACTIVE' },
        data: { status: 'CONFIRMED' }
      });
    });

    // 4. Emit events for exhausted stock (Post-transaction)
    // We can't easily batch this without checking the new qtyOnHand for each.
    // For now, let's keep it simple or do a post-check.
  },

  async syncStockFromDB(variantId: string) {
    const { lockManager } = await import('../../shared/services/managers/lock-manager');
    
    return await lockManager.withLock(`sync_stock:${variantId}`, async () => {
      // Re-check cache after acquiring lock (Double-check pattern)
      const cached = await redis.get(`stock:${variantId}`);
      if (cached !== null) return parseInt(cached, 10);

      const [dbStock, activeReservations] = await Promise.all([
        prisma.stockLevel.aggregate({
          where: { variantId },
          _sum: { qtyOnHand: true }
        }),
        prisma.stockReservation.aggregate({
          where: { variantId, status: 'ACTIVE' },
          _sum: { quantity: true }
        })
      ]);

      const qtyOnHand = dbStock._sum.qtyOnHand || 0;
      const qtyReserved = activeReservations._sum.quantity || 0;
      const available = qtyOnHand - qtyReserved;

      await redis.set(`stock:${variantId}`, available, 'EX', 3600);
      return available;
    }, 2000); // 2s TTL is plenty for a simple aggregation
  },

  async getAvailableStock(variantId: string) {
    const cached = await redis.get(`stock:${variantId}`);
    if (cached !== null) {
      return parseInt(cached, 10);
    }
    return this.syncStockFromDB(variantId);
  }
};

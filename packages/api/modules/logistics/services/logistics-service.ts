import { prisma } from '@ecom/db'
import { publishEvent } from '@ecom/shared'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'PENDING': ['PICKED_UP', 'FAILED'],
  'PICKED_UP': ['IN_TRANSIT', 'FAILED'],
  'IN_TRANSIT': ['OUT_FOR_DELIVERY', 'FAILED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'FAILED'],
  'FAILED': ['PICKED_UP'], // Allow retry from pickup
  'DELIVERED': [] // Terminal state
};

export const logisticsService = {
  async createShipment(packageId: string) {
    const existing = await prisma.shipment.findFirst({ where: { packageId } });
    if (existing) return existing;

    return prisma.shipment.create({
      data: {
        packageId,
        agentId: 'system-unassigned',
        status: 'PENDING'
      }
    });
  },

  async assignAgent(shipmentId: string, agentId: string) {
    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { agentId }
    });

    await publishEvent('shipment.agent_assigned', { shipmentId, agentId });
    return shipment;
  },

  async updateStatus(shipmentId: string, status: string, note?: string, proofUrl?: string) {
    const currentShipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: { status: true, packageId: true }
    });

    if (!currentShipment) throw new Error('SHIPMENT_NOT_FOUND');
    
    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[currentShipment.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`INVALID_TRANSITION: Cannot go from ${currentShipment.status} to ${status}`);
    }

    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { 
        status: status as any,
        proofUrl,
        events: {
          create: { status: status as any, note }
        }
      },
      include: { package: true }
    });

    // B11: Authoritative sync via packageService
    const { packageService } = await import('../../order/services/package-service.js');
    
    // Map ShipmentStatus to PackageStatus (handle mismatches like 'FAILED')
    let packageStatus = status;
    if (status === 'FAILED') packageStatus = 'CANCELLED';
    
    await packageService.updateStatus(shipment.packageId, packageStatus as any);

    await publishEvent('shipment.status_updated', { shipmentId, status });
    
    if (status === 'DELIVERED') {
      await publishEvent('shipment.delivered', { 
        shipmentId, 
        packageId: shipment.packageId,
        proofUrl 
      });
    }

    return shipment;
  },

  async listShipments(agentId?: string) {
    return prisma.shipment.findMany({
      where: agentId ? { agentId } : {},
      orderBy: { createdAt: 'desc' }
    });
  },

  async calculateShipping(userId: string, cartId: string, addressId: string, items?: { weightGrams: number, quantity: number }[]) {
    let totalWeightGrams = 0;

    if (cartId) {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { variant: true } } }
      });
      if (cart) {
        for (const item of cart.items) {
          totalWeightGrams += (item.variant.weightGrams || 500) * item.quantity;
        }
      }
    } else if (items) {
      for (const item of items) {
        totalWeightGrams += (item.weightGrams || 500) * item.quantity;
      }
    } else {
      // Fallback for when we don't have items yet (estimate)
      totalWeightGrams = 1000;
    }

    const address = await prisma.userAddress.findUnique({
      where: { id: addressId }
    });
    if (!address) throw new Error('ADDRESS_NOT_FOUND');

    // Logic: Base fee + Weight-based + State-based multiplier
    const baseFee = 500; // NGN
    const weightFee = Math.ceil(totalWeightGrams / 1000) * 200; // 200 NGN per kg
    
    // Remote states cost more
    const remoteStates = ['Borno', 'Yobe', 'Adamawa', 'Sokoto', 'Kebbi', 'Zamfara'];
    const stateMultiplier = remoteStates.includes(address.state) ? 1.5 : 1.0;

    const total = (baseFee + weightFee) * stateMultiplier;

    return {
      baseFee,
      weightFee,
      totalWeightGrams,
      stateMultiplier,
      total: Math.round(total),
      currency: 'NGN'
    };
  }
};

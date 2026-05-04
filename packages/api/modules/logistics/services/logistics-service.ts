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

    // Sync package status
    // Map shipment status to OrderPackage status if necessary
    // For now they are 1:1 in the modular schema
    await prisma.orderPackage.update({
      where: { id: shipment.packageId },
      data: { status: status as any }
    });

    await publishEvent('shipment.status_updated', { shipmentId, status });
    
    if (status === 'DELIVERED') {
      if (!proofUrl) throw new Error('DELIVERY_PROOF_REQUIRED');

      await publishEvent('shipment.delivered', { 
        shipmentId, 
        packageId: shipment.packageId,
        proofUrl 
      });
      
      const { lockManager } = await import('../../shared/services/managers/lock-manager');
      
      // Atomic check for all packages delivered using a distributed lock on the order
      await lockManager.withLock(`order_delivery:${shipment.package.orderId}`, async () => {
        const otherPackages = await prisma.orderPackage.findMany({
          where: { 
            orderId: shipment.package.orderId,
            id: { not: shipment.packageId }
          },
          select: { status: true }
        });
        
        const allDelivered = otherPackages.every(p => p.status === 'DELIVERED');
        if (allDelivered) {
          await publishEvent('order.delivered', { orderId: shipment.package.orderId });
        }
      });
    }

    return shipment;
  },

  async getAgentShipments(agentId: string, limit: number = 20, offset: number = 0) {
    return prisma.shipment.findMany({
      where: { agentId },
      include: { 
        package: { 
          include: { 
            order: {
              include: {
                address: true
              }
            },
            lines: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }
};

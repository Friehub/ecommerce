import { prisma } from '@ecom/db'
import { publishEvent } from '@ecom/shared'
import type { Service } from '../../../types.js'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'PENDING': ['PICKED_UP', 'FAILED'],
  'PICKED_UP': ['IN_TRANSIT', 'FAILED'],
  'IN_TRANSIT': ['OUT_FOR_DELIVERY', 'FAILED'],
  'OUT_FOR_DELIVERY': ['DELIVERED', 'FAILED'],
  'FAILED': ['PICKED_UP'], // Allow retry from pickup
  'DELIVERED': [] // Terminal state
};

export const logisticsService: Service = {
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

  async getAgentShipments(agentId: string) {
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
      orderBy: { createdAt: 'desc' }
    });
  }
};

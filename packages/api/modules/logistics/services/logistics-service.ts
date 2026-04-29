import { prisma } from '@ecom/db'
import { publishEvent } from '@ecom/shared'

export const logisticsService = {
  async createShipment(packageId: string) {
    // Check if shipment already exists
    const existing = await prisma.shipment.findFirst({ where: { packageId } });
    if (existing) return existing;

    return prisma.shipment.create({
      data: {
        packageId,
        agentId: 'system-unassigned', // Temporary placeholder
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

  async updateStatus(shipmentId: string, status: any, note?: string, proofUrl?: string) {
    const shipment = await prisma.shipment.update({
      where: { id: shipmentId },
      data: { 
        status,
        proofUrl,
        events: {
          create: { status, note }
        }
      },
      include: { package: true }
    });

    // Sync package status
    await prisma.orderPackage.update({
      where: { id: shipment.packageId },
      data: { status: status as any } // Simplified mapping for contest
    });

    await publishEvent('shipment.status_updated', { shipmentId, status });
    
    if (status === 'DELIVERED') {
      await publishEvent('order.package_delivered', { packageId: shipment.packageId });
    }

    return shipment;
  },

  async getAgentShipments(agentId: string) {
    return prisma.shipment.findMany({
      where: { agentId },
      include: { package: { include: { order: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
};

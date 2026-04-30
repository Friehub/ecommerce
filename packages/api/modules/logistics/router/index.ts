import { createTRPCRouter, agentProcedure, adminProcedure } from "../../../trpc";
import { z } from "zod";
import { logisticsService } from "../services/logistics-service";
import { mediaService } from "../../media/services/media-service";
import { prisma } from "@ecom/db";

export const logisticsRouter = createTRPCRouter({
  getMyShipments: agentProcedure.query(async ({ ctx }) => {
    // We need to get the agent ID for the user
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: ctx.session.user.id }
    });
    
    if (!agent) throw new Error('NOT_AN_AGENT');
    
    return await logisticsService.getAgentShipments(agent.id);
  }),

  updateShipmentStatus: agentProcedure
    .input(z.object({
      shipmentId: z.string(),
      status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED']),
      note: z.string().optional(),
      proofUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await logisticsService.updateStatus(input.shipmentId, input.status, input.note, input.proofUrl);
    }),

  assignAgent: adminProcedure
    .input(z.object({
      shipmentId: z.string(),
      agentId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await logisticsService.assignAgent(input.shipmentId, input.agentId);
    }),

  listAllShipments: adminProcedure.query(async () => {
    return await prisma.shipment.findMany({
      include: { package: true, agent: true }
    });
  }),

  getPresignedUrl: agentProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await mediaService.getUploadUrl(input.fileName, input.contentType);
    }),

  listAgents: adminProcedure.query(async () => {
    return await prisma.deliveryAgent.findMany({
      include: { user: true }
    });
  }),
});

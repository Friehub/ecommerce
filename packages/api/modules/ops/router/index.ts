import { createTRPCRouter, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { opsService } from "../services/ops-service.js";

const eventLogService = prisma.eventLog;

const _opsRouter = createTRPCRouter({
  getGlobalMetrics: adminProcedure.query(async () => {
    return await opsService.getGlobalMetrics();
  }),

  getAuditLogs: adminProcedure.query(async () => {
    return eventLogService.findMany({
      where: { topic: 'ADMIN_ACTION' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }),

  getTimeSeries: adminProcedure.query(async () => {
    return await opsService.getAnalyticsTimeSeries();
  }),
  
  getSystemHealth: adminProcedure.query(async () => {
    return await opsService.getSystemHealth();
  }),
});

export const opsRouter = _opsRouter;
export type OpsRouter = typeof _opsRouter;

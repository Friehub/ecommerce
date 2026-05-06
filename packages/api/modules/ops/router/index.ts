import { createTRPCRouter, adminProcedure } from "../../../trpc.js";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { opsService } from "../services/ops-service.js";

const _opsRouter = createTRPCRouter({
  getMetrics: adminProcedure.query(async () => {
    return await opsService.getGlobalMetrics();
  }),

  getGlobalMetrics: adminProcedure.query(async () => {
    return await opsService.getGlobalMetrics();
  }),

  getAuditLogs: adminProcedure.query(async () => {
    return [];
  }),
});

export const opsRouter = _opsRouter as any;
export type OpsRouter = typeof _opsRouter;

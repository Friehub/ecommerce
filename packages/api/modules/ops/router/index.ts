import { createTRPCRouter, adminProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { opsService } from "../services/ops-service";

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

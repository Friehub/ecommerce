import { createTRPCRouter, adminProcedure } from "../../../trpc";
import { prisma } from "@ecom/db";
import { z } from "zod";
import { opsService } from "../services/ops-service";

export const opsRouter = createTRPCRouter({
  getMetrics: adminProcedure.query(async () => {
    return await opsService.getGlobalMetrics();
  }),

  getAuditLogs: adminProcedure.query(async () => {
    return [];
  }),
});

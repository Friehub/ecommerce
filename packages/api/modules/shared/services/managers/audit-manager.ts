import { prisma } from '@ecom/db';

export interface AuditEntry {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditManager {
  async log(entry: AuditEntry) {
    try {
      return await prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata || {},
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        }
      });
    } catch (error) {
      // Fail silently in audit logging to not block business transactions, 
      // but log to error console/monitoring.
      console.error('[AuditManager] Failed to record audit log:', error);
    }
  }

  async getLogsForEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const auditManager = new AuditManager();

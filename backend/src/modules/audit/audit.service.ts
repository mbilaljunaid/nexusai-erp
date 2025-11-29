import { Injectable } from '@nestjs/common';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { before: any; after: any }>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
}

@Injectable()
export class AuditService {
  private logs: AuditLog[] = [];
  private logCounter = 1;

  log(
    tenantId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes: Record<string, { before: any; after: any }>,
    userId?: string,
    ipAddress?: string,
  ): AuditLog {
    const auditLog: AuditLog = {
      id: `audit_${this.logCounter++}`,
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date(),
      ipAddress,
      status: 'success',
    };

    this.logs.push(auditLog);
    return auditLog;
  }

  getLogs(tenantId: string, entityType?: string, days: number = 30): AuditLog[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.logs.filter((log) => {
      if (log.tenantId !== tenantId) return false;
      if (entityType && log.entityType !== entityType) return false;
      if (log.timestamp < cutoffDate) return false;
      return true;
    });
  }

  getEntityHistory(tenantId: string, entityType: string, entityId: string): AuditLog[] {
    return this.logs.filter(
      (log) =>
        log.tenantId === tenantId &&
        log.entityType === entityType &&
        log.entityId === entityId,
    );
  }

  getUserActions(tenantId: string, userId: string, days: number = 30): AuditLog[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.logs.filter(
      (log) =>
        log.tenantId === tenantId &&
        log.userId === userId &&
        log.timestamp >= cutoffDate,
    );
  }
}

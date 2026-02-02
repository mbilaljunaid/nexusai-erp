/**
 * Audit Logger - Phase 3
 * Track all GL entries and form changes for compliance
 */

import type { GLEntry } from "@shared/types/metadata";

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: "created" | "updated" | "deleted" | "posted" | "reversed";
  entityType: "form" | "glentry" | "glaccount";
  entityId: string;
  changes: {
    before?: Record<string, any>;
    after: Record<string, any>;
  };
  description: string;
  ipAddress?: string;
}

export class AuditLogger {
  private logs: AuditLog[] = [];
  private logCounter: number = 0;

  /**
   * Log form submission
   */
  async logFormSubmission(
    formId: string,
    formData: Record<string, any>,
    userId?: string
  ): Promise<void> {
    this.logs.push({
      id: `AUDIT-${Date.now()}-${++this.logCounter}`,
      timestamp: new Date(),
      userId,
      action: "created",
      entityType: "form",
      entityId: `${formId}-${Date.now()}`,
      changes: {
        after: formData,
      },
      description: `Form submitted: ${formId}`,
    });
  }

  /**
   * Log GL entry creation
   */
  async logGLEntry(entry: GLEntry, userId?: string, action: "created" | "updated" | "deleted" | "posted" | "reversed" = "created"): Promise<void> {
    this.logs.push({
      id: `AUDIT-${Date.now()}-${++this.logCounter}`,
      timestamp: new Date(),
      userId,
      action,
      entityType: "glentry",
      entityId: entry.id || "",
      changes: {
        after: entry,
      },
      description: `GL entry ${action}: ${entry.account} - ${entry.description}`,
    });
  }

  /**
   * Log form update
   */
  async logFormUpdate(
    formId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    userId?: string
  ): Promise<void> {
    this.logs.push({
      id: `AUDIT-${Date.now()}-${++this.logCounter}`,
      timestamp: new Date(),
      userId,
      action: "updated",
      entityType: "form",
      entityId: formId,
      changes: { before, after },
      description: `Form updated: ${formId}`,
    });
  }

  /**
   * Log form deletion
   */
  async logFormDeletion(formId: string, formData: Record<string, any>, userId?: string): Promise<void> {
    this.logs.push({
      id: `AUDIT-${Date.now()}-${++this.logCounter}`,
      timestamp: new Date(),
      userId,
      action: "deleted",
      entityType: "form",
      entityId: formId,
      changes: {
        before: formData,
        after: {},
      },
      description: `Form deleted: ${formId}`,
    });
  }

  /**
   * Get audit logs for entity
   */
  getLogsForEntity(entityId: string): AuditLog[] {
    return this.logs.filter((log) => log.entityId.includes(entityId));
  }

  /**
   * Get audit logs by user
   */
  getLogsByUser(userId: string): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Get audit logs for date range
   */
  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate);
  }

  /**
   * Get all audit logs
   */
  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Generate audit report
   */
  generateAuditReport(startDate: Date, endDate: Date): {
    period: { start: Date; end: Date };
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByUser: Record<string, number>;
    logs: AuditLog[];
  } {
    const logsInRange = this.getLogsByDateRange(startDate, endDate);
    const eventsByType: Record<string, number> = {};
    const eventsByUser: Record<string, number> = {};

    for (const log of logsInRange) {
      eventsByType[log.entityType] = (eventsByType[log.entityType] || 0) + 1;
      if (log.userId) {
        eventsByUser[log.userId] = (eventsByUser[log.userId] || 0) + 1;
      }
    }

    return {
      period: { start: startDate, end: endDate },
      totalEvents: logsInRange.length,
      eventsByType,
      eventsByUser,
      logs: logsInRange,
    };
  }
}

export const auditLogger = new AuditLogger();

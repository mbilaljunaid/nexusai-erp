/**
 * Enhanced Audit Service
 *
 * Writes to admin_logs with full before/after state, actor, tenant, and justification.
 * This replaces the thin audit_service.ts for mutations that need complete traceability.
 */

import { db } from '../db';
import { adminLogs } from '../../shared/schema/admin';
import { eq } from 'drizzle-orm';

export interface AuditParams {
    actorId?: string;
    actorEmail?: string;
    actorType?: 'user' | 'system' | 'ai';
    action: string;
    resourceType?: string;
    resourceId?: string;
    intent?: string;
    details?: string;
    beforeState?: Record<string, any> | null;
    afterState?: Record<string, any> | null;
    justification?: string;
    tenantId?: string;
    ipAddress?: string;
    userAgent?: string;
}

class EnhancedAuditService {

    /**
     * Record an audit log entry with full before/after state.
     * Non-throwing — audit failures are logged to console but never propagate.
     */
    async record(params: AuditParams): Promise<void> {
        try {
            await db.insert(adminLogs as any).values({
                actorId: params.actorId ?? null,
                actorEmail: params.actorEmail ?? null,
                actorType: params.actorType ?? 'system',
                action: params.action,
                resourceType: params.resourceType ?? null,
                resourceId: params.resourceId ?? null,
                intent: params.intent ?? null,
                details: params.details ?? null,
                beforeState: params.beforeState ?? null,
                afterState: params.afterState ?? null,
                justification: params.justification ?? null,
                tenantId: params.tenantId ?? null,
                ipAddress: params.ipAddress ?? null,
                userAgent: params.userAgent ?? null,
            });
        } catch (err: any) {
            // Failsafe: never crash the calling request due to audit write failure
            console.error('[EnhancedAudit] Failed to write audit log:', err.message);
            console.log('[EnhancedAudit] FALLBACK:', JSON.stringify(params));
        }
    }

    /**
     * Fetch the current state of a row before a mutation.
     * Returns null if the row doesn't exist or the fetch fails.
     *
     * Usage:
     *   const before = await enhancedAuditService.captureState(glJournals, 'id', journalId);
     */
    async captureState(table: any, idColumn: string, id: string): Promise<Record<string, any> | null> {
        try {
            const rows = await db.select().from(table).where(eq(table[idColumn], id));
            return rows[0] ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Safely read tenantId from a request object.
     */
    extractTenantId(req: any): string | undefined {
        return req?.tenantId ?? req?.headers?.['x-tenant-id'] ?? undefined;
    }
}

export const enhancedAuditService = new EnhancedAuditService();

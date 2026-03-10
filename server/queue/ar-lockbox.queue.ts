/**
 * AR Lockbox + AutoInvoice Queue (BullMQ)
 *
 * Handles durable AR processing jobs:
 *   LOCKBOX_MATCH      — run 3-tier auto-match on a lockbox batch
 *   AUTOINVOICE_IMPORT — validate + import AR invoice batch
 */

import { Job } from 'bullmq';
import { createQueue, createWorker } from './bullmq';

// ---------------------------------------------------------------------------
// Job Payload Types
// ---------------------------------------------------------------------------

export type ARJobType = 'LOCKBOX_MATCH' | 'AUTOINVOICE_IMPORT';

export interface ARLockboxJobData {
    type: ARJobType;
    tenantId: string;
    userId: string;
    batchId?: string;
    importRunId?: string;
}

// ---------------------------------------------------------------------------
// Queue Instance
// ---------------------------------------------------------------------------

export const AR_LOCKBOX_QUEUE = 'ar-lockbox';

export const arLockboxQueue = createQueue(AR_LOCKBOX_QUEUE);

// ---------------------------------------------------------------------------
// Worker (processor)
// ---------------------------------------------------------------------------

async function processARJob(job: Job<ARLockboxJobData>) {
    const { type, tenantId, batchId, importRunId } = job.data;
    console.log(`[ARLockboxQueue] Processing job ${job.id}: ${type} tenant=${tenantId}`);

    switch (type) {
        case 'LOCKBOX_MATCH': {
            if (!batchId) throw new Error('batchId required for LOCKBOX_MATCH');
            // Lazy import to avoid circular dep
            const { lockboxService } = await import('../modules/finance/lockbox.service');
            const result = await lockboxService.runAutoMatch(batchId);
            await job.updateProgress(100);
            return result;
        }

        case 'AUTOINVOICE_IMPORT': {
            if (!importRunId) throw new Error('importRunId required for AUTOINVOICE_IMPORT');
            const { autoinvoiceService } = await import('../modules/finance/autoinvoice.service');
            const result = await autoinvoiceService.runValidation(importRunId, job.data.userId);
            await job.updateProgress(100);
            return result;
        }

        default:
            throw new Error(`Unknown AR job type: ${type}`);
    }
}

export let arLockboxWorker: ReturnType<typeof createWorker> | null = null;

export function startARLockboxWorker() {
    if (!process.env.REDIS_URL) {
        console.warn('[ARLockboxQueue] REDIS_URL not set — queue worker disabled');
        return;
    }
    arLockboxWorker = createWorker<ARLockboxJobData>(AR_LOCKBOX_QUEUE, processARJob);
    console.log('[ARLockboxQueue] Worker started');
}

// ---------------------------------------------------------------------------
// Service Helpers
// ---------------------------------------------------------------------------

export const arLockboxQueueService = {
    async matchBatch(tenantId: string, userId: string, batchId: string) {
        return arLockboxQueue.add('LOCKBOX_MATCH', {
            type: 'LOCKBOX_MATCH', tenantId, userId, batchId,
        });
    },

    async importAutoinvoice(tenantId: string, userId: string, importRunId: string) {
        return arLockboxQueue.add('AUTOINVOICE_IMPORT', {
            type: 'AUTOINVOICE_IMPORT', tenantId, userId, importRunId,
        });
    },
};

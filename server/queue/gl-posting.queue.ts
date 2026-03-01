/**
 * GL Journal Posting Queue (BullMQ)
 *
 * Handles durable GL posting jobs:
 *   POST_JOURNAL        — post a draft journal to the GL
 *   PERIOD_CLOSE_SWEEP  — run period-close validation sweep
 *   REVALUATION_RUN     — trigger FX revaluation for a ledger/period
 */

import { Job } from 'bullmq';
import { createQueue, createWorker } from './bullmq';
import { financeService } from '../services/finance';
import { closeEngine } from '../services/period-close/CloseEngine';

// ---------------------------------------------------------------------------
// Job Payload Types
// ---------------------------------------------------------------------------

export type GLJobType = 'POST_JOURNAL' | 'PERIOD_CLOSE_SWEEP' | 'REVALUATION_RUN';

export interface GLPostingJobData {
    type: GLJobType;
    tenantId: string;
    userId: string;
    journalId?: string;
    ledgerId?: string;
    periodName?: string;
    currencyCode?: string;
}

// ---------------------------------------------------------------------------
// Queue Instance
// ---------------------------------------------------------------------------

export const GL_POSTING_QUEUE = 'gl-posting';

export const glPostingQueue = createQueue(GL_POSTING_QUEUE);

// ---------------------------------------------------------------------------
// Worker (processor)
// ---------------------------------------------------------------------------

async function processGLJob(job: Job<GLPostingJobData>) {
    const { type, tenantId, journalId, ledgerId, periodName } = job.data;
    console.log(`[GLPostingQueue] Processing job ${job.id}: ${type} tenant=${tenantId}`);

    switch (type) {
        case 'POST_JOURNAL': {
            if (!journalId) throw new Error('journalId required for POST_JOURNAL');
            console.log(`[GLPostingQueue] Processing POST_JOURNAL journalId=${journalId} userId=${job.data.userId}`);

            // Invoke the internal synchronous posting method (assumes processPostingInBackground contains the direct db logic, 
            // or we use a dedicated synchronous method). Since finance.ts triggers the queue, the worker must do the actual DB updates.
            // For now, we will call financeService.processPostingInBackground directly, passing the parameters.

            await financeService.processPostingInBackground(journalId, job.data.userId || 'SYSTEM', {
                sessionId: 'WORKER_SESSION'
            });

            await job.updateProgress(100);
            return { journalId, status: 'posted' };
        }

        case 'PERIOD_CLOSE_SWEEP': {
            if (!ledgerId || !periodName) throw new Error('ledgerId and periodName required');
            console.log(`[GLPostingQueue] Executing Period close sweep: ledger=${ledgerId} period=${periodName}`);

            // Needs next period name. Ideally passed in data, but we can derive it or sweep to 'Next Open'.
            // CloseEngine sweepEvents expects (ledgerId, fromPeriodName, toPeriodName)
            const result = await closeEngine.sweepEvents(ledgerId, periodName, 'NEXT_OPEN');

            await job.updateProgress(100);
            return { sweptCount: result.count };
        }

        case 'REVALUATION_RUN': {
            if (!ledgerId || !periodName) throw new Error('ledgerId and periodName required');
            const { fxRevaluationService } = await import('../modules/finance/fx-revaluation.service');
            const result = await (fxRevaluationService as any).runRevaluation(
                ledgerId,
                periodName,
                job.data.currencyCode || 'USD',
                job.data.userId,
            );
            await job.updateProgress(100);
            return result;
        }

        default:
            throw new Error(`Unknown GL job type: ${type}`);
    }
}

export let glPostingWorker: ReturnType<typeof createWorker<GLPostingJobData>> | null = null;

export function startGLPostingWorker() {
    if (!process.env.REDIS_URL) {
        console.warn('[GLPostingQueue] REDIS_URL not set — queue worker disabled');
        return;
    }
    glPostingWorker = createWorker<GLPostingJobData>(GL_POSTING_QUEUE, processGLJob);
    console.log('[GLPostingQueue] Worker started');
}

// ---------------------------------------------------------------------------
// Service Helpers
// ---------------------------------------------------------------------------

export const glPostingQueueService = {
    async postJournal(tenantId: string, userId: string, journalId: string) {
        return glPostingQueue.add('POST_JOURNAL', {
            type: 'POST_JOURNAL', tenantId, userId, journalId,
        });
    },

    async triggerPeriodCloseSweep(tenantId: string, userId: string, ledgerId: string, periodName: string) {
        return glPostingQueue.add('PERIOD_CLOSE_SWEEP', {
            type: 'PERIOD_CLOSE_SWEEP', tenantId, userId, ledgerId, periodName,
        });
    },

    async runRevaluation(tenantId: string, userId: string, ledgerId: string, periodName: string, currencyCode: string) {
        return glPostingQueue.add('REVALUATION_RUN', {
            type: 'REVALUATION_RUN', tenantId, userId, ledgerId, periodName, currencyCode,
        }, { priority: 1 }); // Higher priority
    },
};

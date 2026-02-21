/**
 * Accounting Close Queue (BullMQ)
 *
 * BullMQ upgrade of the setInterval-based accounting-close.worker.ts.
 * Picks up rows from accounting_jobs and dispatches them as typed BullMQ jobs.
 *
 * The legacy setInterval worker continues as a fallback when Redis is unavailable.
 */

import { Job } from 'bullmq';
import { createQueue, createWorker } from './bullmq';
import { accountingSchedulerService } from '../modules/sla/accounting-scheduler.service';
import { consolidationService } from '../modules/finance/consolidation.service';

// ---------------------------------------------------------------------------
// Job Payload Types
// ---------------------------------------------------------------------------

export type AccountingJobType = 'ConsolidationRun' | 'CloseJournals' | 'TransferToGL' | 'ReconRun' | 'CreateAcctg';

export interface AccountingCloseJobData {
    jobType: AccountingJobType;
    accountingJobId: string;
    ledgerId?: string;
    periodName?: string;
    tenantId: string;
    runBy: string;
}

// ---------------------------------------------------------------------------
// Queue Instance
// ---------------------------------------------------------------------------

export const ACCOUNTING_CLOSE_QUEUE = 'accounting-close';

export const accountingCloseQueue = createQueue(ACCOUNTING_CLOSE_QUEUE);

// ---------------------------------------------------------------------------
// Worker (processor)
// ---------------------------------------------------------------------------

async function processAccountingJob(job: Job<AccountingCloseJobData>) {
    const { jobType, accountingJobId, ledgerId, periodName, runBy } = job.data;
    console.log(`[AccountingCloseQueue] Processing job ${job.id}: ${jobType} dbJobId=${accountingJobId}`);

    await accountingSchedulerService.markRunning(accountingJobId);
    const start = Date.now();

    try {
        switch (jobType) {
            case 'ConsolidationRun': {
                if (!ledgerId || !periodName) throw new Error('ConsolidationRun requires ledger_id and period_name');
                await consolidationService.runConsolidation(ledgerId, periodName, runBy);
                break;
            }

            case 'CloseJournals': {
                console.log(`[AccountingCloseQueue] CloseJournals period=${periodName}`);
                break;
            }

            case 'TransferToGL': {
                console.log(`[AccountingCloseQueue] TransferToGL ledger=${ledgerId}`);
                break;
            }

            case 'ReconRun': {
                console.log(`[AccountingCloseQueue] ReconRun ledger=${ledgerId}`);
                break;
            }

            case 'CreateAcctg': {
                console.log(`[AccountingCloseQueue] CreateAcctg period=${periodName}`);
                break;
            }

            default:
                throw new Error(`Unknown accounting job type: ${jobType}`);
        }

        const duration = Date.now() - start;
        await accountingSchedulerService.markCompleted(accountingJobId, duration);
        await job.updateProgress(100);

    } catch (err: any) {
        await accountingSchedulerService.markFailed(accountingJobId, err.message);
        throw err; // rethrow so BullMQ tracks as failed and retries
    }
}

export let accountingCloseWorker: ReturnType<typeof createWorker> | null = null;

export function startAccountingCloseQueue() {
    if (!process.env.REDIS_URL) {
        console.warn('[AccountingCloseQueue] REDIS_URL not set — using legacy polling worker instead');
        return;
    }
    accountingCloseWorker = createWorker<AccountingCloseJobData>(ACCOUNTING_CLOSE_QUEUE, processAccountingJob, 2);
    console.log('[AccountingCloseQueue] BullMQ worker started (concurrency=2)');
}

// ---------------------------------------------------------------------------
// Dispatcher: enqueue pending jobs from accounting_jobs table
// ---------------------------------------------------------------------------

export async function dispatchPendingAccountingJobs(tenantId = 'default') {
    try {
        const dueJobs = await accountingSchedulerService.getDueJobs() as any[];
        for (const j of dueJobs) {
            await accountingCloseQueue.add(j.job_type, {
                jobType: j.job_type,
                accountingJobId: j.id,
                ledgerId: j.ledger_id,
                periodName: j.period_name,
                tenantId: j.tenant_id || tenantId,
                runBy: j.run_by,
            });
            console.log(`[AccountingCloseQueue] Enqueued DB job ${j.id} (${j.job_type})`);
        }
    } catch (err) {
        console.error('[AccountingCloseQueue] Dispatch error:', err);
    }
}

// ---------------------------------------------------------------------------
// Service helper
// ---------------------------------------------------------------------------

export const accountingCloseQueueService = {
    async enqueueConsolidation(tenantId: string, userId: string, ledgerId: string, periodName: string) {
        return accountingCloseQueue.add('ConsolidationRun', {
            jobType: 'ConsolidationRun',
            accountingJobId: 'inline',
            ledgerId,
            periodName,
            tenantId,
            runBy: userId,
        });
    },
};

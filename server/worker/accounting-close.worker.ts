/**
 * AccountingCloseWorker — SLA-OG-01 (BullMQ ESS Job Replacement)
 *
 * Polls accounting_jobs table every minute and dispatches jobs to appropriate handlers.
 * Crash-safe: marks jobs as Running atomically before executing.
 *
 * To start: import and call startAccountingCloseWorker() in server/index.ts
 */

import { accountingSchedulerService } from "../modules/sla/accounting-scheduler.service";
import { consolidationService } from "../modules/finance/consolidation.service";

let workerInterval: ReturnType<typeof setInterval> | null = null;

type AcctgJob = {
    id: string;
    job_type: string;
    ledger_id: string | null;
    period_name: string | null;
    run_by: string;
    tenant_id: string;
};

async function dispatchJob(job: AcctgJob) {
    const start = Date.now();
    try {
        await accountingSchedulerService.markRunning(job.id);

        switch (job.job_type) {
            case 'ConsolidationRun': {
                if (!job.ledger_id || !job.period_name) {
                    throw new Error('ConsolidationRun requires ledger_id and period_name');
                }
                await consolidationService.runConsolidation(
                    job.ledger_id,
                    job.period_name,
                    job.run_by
                );
                break;
            }

            case 'CloseJournals': {
                // TODO: Call period-close service when built (P1-B FE)
                console.log(`[AccountingWorker] CloseJournals for period ${job.period_name} — pending full implementation`);
                break;
            }

            case 'TransferToGL': {
                // TODO: Call SLA transfer-to-GL service (SLA-OG-02)
                console.log(`[AccountingWorker] TransferToGL for ledger ${job.ledger_id}`);
                break;
            }

            case 'ReconRun': {
                // TODO: Call bank-reconciliation scheduler (CM-OG-01)
                console.log(`[AccountingWorker] ReconRun for ledger ${job.ledger_id}`);
                break;
            }

            case 'CreateAcctg': {
                // TODO: SLA accounting creation job
                console.log(`[AccountingWorker] CreateAcctg for period ${job.period_name}`);
                break;
            }

            default:
                throw new Error(`Unknown job type: ${job.job_type}`);
        }

        const duration = Date.now() - start;
        await accountingSchedulerService.markCompleted(job.id, duration);
        console.log(`[AccountingWorker] ✅ Job ${job.id} (${job.job_type}) completed in ${duration}ms`);

    } catch (error: any) {
        console.error(`[AccountingWorker] ❌ Job ${job.id} failed:`, error.message);
        await accountingSchedulerService.markFailed(job.id, error.message);
    }
}

export function startAccountingCloseWorker(pollIntervalMs = 60_000) {
    if (workerInterval) {
        console.warn('[AccountingWorker] Already running');
        return;
    }

    console.log(`[AccountingWorker] Starting — poll every ${pollIntervalMs / 1000}s`);

    const tick = async () => {
        try {
            const dueJobs = await accountingSchedulerService.getDueJobs() as AcctgJob[];
            for (const job of dueJobs) {
                // Fire-and-forget each job (parallel dispatch, each handles own error)
                dispatchJob(job).catch(console.error);
            }
        } catch (err) {
            console.error('[AccountingWorker] Poll error:', err);
        }
    };

    // Run immediately on start, then poll
    tick();
    workerInterval = setInterval(tick, pollIntervalMs);
}

export function stopAccountingCloseWorker() {
    if (workerInterval) {
        clearInterval(workerInterval);
        workerInterval = null;
        console.log('[AccountingWorker] Stopped');
    }
}

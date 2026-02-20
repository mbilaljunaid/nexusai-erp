import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * AccountingSchedulerService — SLA-OG-01
 *
 * ESS (Enterprise Scheduler Service) replacement using BullMQ concepts.
 * Manages nightly accounting jobs: period close, GL transfer, reconciliation runs, consolidation runs.
 * Workers are registered in server/worker/accounting-close.worker.ts.
 */
export class AccountingSchedulerService {

    /** Register a new scheduled accounting job */
    async createJob(params: {
        tenantId: string;
        jobType: 'CloseJournals' | 'CreateAcctg' | 'TransferToGL' | 'ReconRun' | 'ConsolidationRun';
        scheduleCron?: string;
        ledgerId?: string;
        periodName?: string;
        runBy: string;
    }) {
        const { tenantId, jobType, scheduleCron, ledgerId, periodName, runBy } = params;

        // Calculate next run from cron
        const nextRun = scheduleCron ? this._nextRunFromCron(scheduleCron) : new Date();

        const [job] = (await db.execute(sql`
            INSERT INTO accounting_jobs (
                tenant_id, job_type, schedule_cron, ledger_id, period_name,
                status, next_run_at, run_by
            ) VALUES (
                ${tenantId}, ${jobType}, ${scheduleCron ?? null},
                ${ledgerId ?? null}, ${periodName ?? null},
                'Scheduled', ${nextRun.toISOString()}, ${runBy}
            )
            RETURNING *
        `)) as any;

        return job;
    }

    /** Mark job as running (called by BullMQ worker at pick-up) */
    async markRunning(jobId: string) {
        await db.execute(sql`
            UPDATE accounting_jobs
            SET status = 'Running', last_run_at = NOW(), updated_at = NOW()
            WHERE id = ${jobId} AND status = 'Scheduled'
        `);
    }

    /** Mark job completed (called by BullMQ worker on success) */
    async markCompleted(jobId: string, durationMs: number) {
        await db.execute(sql`
            UPDATE accounting_jobs
            SET status = 'Completed', last_run_duration_ms = ${durationMs}, updated_at = NOW()
            WHERE id = ${jobId}
        `);
        // Re-schedule if cron-based
        await db.execute(sql`
            UPDATE accounting_jobs
            SET status = 'Scheduled',
                next_run_at = NOW() + INTERVAL '1 day',
                updated_at = NOW()
            WHERE id = ${jobId} AND schedule_cron IS NOT NULL
        `);
    }

    /** Mark job failed */
    async markFailed(jobId: string, errorLog: string) {
        await db.execute(sql`
            UPDATE accounting_jobs
            SET status = 'Failed', error_log = ${errorLog}, updated_at = NOW()
            WHERE id = ${jobId}
        `);
    }

    /** Get all scheduled jobs for a tenant */
    async listJobs(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM accounting_jobs
            WHERE tenant_id = ${tenantId}
            ORDER BY next_run_at ASC
        `) as any).rows;
    }

    /** Get jobs due now (called by BullMQ scheduler on tick) */
    async getDueJobs() {
        return (await db.execute(sql`
            SELECT * FROM accounting_jobs
            WHERE status = 'Scheduled'
              AND next_run_at <= NOW()
            ORDER BY next_run_at ASC
            LIMIT 50
        `) as any).rows;
    }

    /** Run a job immediately (on-demand) */
    async triggerNow(jobId: string, userId: string) {
        await db.execute(sql`
            UPDATE accounting_jobs
            SET status = 'Scheduled', next_run_at = NOW(), run_by = ${userId}, updated_at = NOW()
            WHERE id = ${jobId}
        `);
        return { jobId, message: 'Scheduled for immediate execution' };
    }

    private _nextRunFromCron(cron: string): Date {
        // Simple parser: support '0 2 * * *' format (hour-based)
        const parts = cron.split(' ');
        const hour = parseInt(parts[1] ?? '2', 10);
        const next = new Date();
        next.setHours(hour, 0, 0, 0);
        if (next <= new Date()) next.setDate(next.getDate() + 1);
        return next;
    }
}

export const accountingSchedulerService = new AccountingSchedulerService();

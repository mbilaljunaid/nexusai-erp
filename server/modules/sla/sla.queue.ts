
import Queue from "bull";
import { SlaEventPayload, slaEngine } from "./sla.service";

// Create Queue
export const slaQueue = new Queue<SlaEventPayload>("sla-accounting", process.env.REDIS_URL || "redis://localhost:6379");

// Register Worker Logic
slaQueue.process(async (job) => {
    console.log(`[SLA-QUEUE] Processing Job ${job.id} for Entity ${job.data.entityId}`);
    try {
        const result = await slaEngine.createAccounting(job.data);
        return { success: true, headerId: result?.id };
    } catch (error: any) {
        console.error(`[SLA-QUEUE] Job ${job.id} Failed:`, error.message);
        throw error;
    }
});

/**
 * Service Wrapper for Async Accounting
 */
export const slaQueueService = {
    async queueAccounting(payload: SlaEventPayload) {
        // Enqueue Job
        const job = await slaQueue.add(payload, {
            attempts: 3,
            backoff: 5000 // Retry every 5s
        });
        console.log(`[SLA-QUEUE] Enqueued Job ${job.id} for ${payload.eventClassId}`);
        return { jobId: job.id, status: "queued" };
    },

    async getJobStatus(jobId: string) {
        const job = await slaQueue.getJob(jobId);
        if (!job) return null;
        return {
            id: job.id,
            state: await job.getState(),
            progress: job.progress(),
            result: job.returnvalue,
            error: job.failedReason
        };
    }
};


import { db } from "../db";
import { arDunningRuns, arCollectorTasks, arInvoices, arDunningTemplates, arCustomers } from "@shared/schema";
import { eq, and, lte, isNotNull, sql } from "drizzle-orm";

export class DunningWorker {
    static async processRun(runId: string) {
        console.log(`[DunningWorker] Starting Run ${runId}`);

        try {
            await db.update(arDunningRuns)
                .set({ status: "InProgress" })
                .where(eq(arDunningRuns.id, runId));

            // 1. Identify Overdue Invoices
            // Optimization: Process in chunks if this list is huge, but for now just fetching IDs first 
            // is better than full objects if we can, or just stream.
            // Simplified: Fetch full list of Open invoices with DueDate < Now
            const overdue = await db.select().from(arInvoices)
                .where(and(
                    sql`${arInvoices.status} IN ('Sent', 'PartiallyPaid', 'Overdue')`,
                    sql`${arInvoices.dueDate} < NOW()`
                ));

            console.log(`[DunningWorker] Found ${overdue.length} overdue invoices.`);

            // 2. Fetch Templates
            const templates = await db.select().from(arDunningTemplates);

            let tasksCreated = 0;
            const tasksToInsert: any[] = [];
            const invoicesToUpdate: string[] = [];

            for (const inv of overdue) {
                const dueDate = new Date(inv.dueDate!);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - dueDate.getTime());
                const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Find matching template
                const match = templates.find(t => daysOverdue >= (t.daysOverdueMin || 0) && daysOverdue <= (t.daysOverdueMax || 9999));

                if (match) {
                    // Check existing tasks (Pseudo-check for performance, ideal would be DB join)
                    // Here we skip strict dupe check for bulk perf, or we assume the run is idempotent per day.
                    // Let's Insert.
                    tasksToInsert.push({
                        customerId: inv.customerId,
                        invoiceId: inv.id,
                        taskType: "Email",
                        priority: match.severity || "Medium",
                        status: "Open",
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
                    });
                    tasksCreated++;
                    invoicesToUpdate.push(inv.id);
                }
            }

            // Batch Insert Tasks (Chunking 100)
            const chunkSize = 100;
            for (let i = 0; i < tasksToInsert.length; i += chunkSize) {
                const chunk = tasksToInsert.slice(i, i + chunkSize);
                await db.insert(arCollectorTasks).values(chunk);
            }

            // Bulk Update Invoice Status to 'Overdue'
            if (invoicesToUpdate.length > 0) {
                // Drizzle doesn't support "WHERE IN (...)" updates easily for massive arrays sometimes, 
                // but let's try standard IN.
                await db.update(arInvoices)
                    .set({ status: "Overdue" })
                    .where(sql`${arInvoices.id} IN ${invoicesToUpdate}`);
            }

            // 3. Complete Run
            await db.update(arDunningRuns)
                .set({
                    status: "Completed",
                    totalInvoicesProcessed: overdue.length,
                    totalLettersGenerated: tasksCreated
                })
                .where(eq(arDunningRuns.id, runId));

            console.log(`[DunningWorker] Completed Run ${runId}. Tasks: ${tasksCreated}`);

        } catch (err) {
            console.error(`[DunningWorker] Failed Run ${runId}`, err);
            await db.update(arDunningRuns)
                .set({ status: "Failed" })
                .where(eq(arDunningRuns.id, runId));
        }
    }
}

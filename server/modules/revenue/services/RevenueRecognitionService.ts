
import { db } from "../../../db";
import { revenueSchedules, revenueScheduleLines, revenueRules, glJournals, glJournalLines } from "@shared/schema";

import { eq, and } from "drizzle-orm";
import { addMonths, startOfMonth, endOfMonth, format } from "date-fns";

export class RevenueRecognitionService {

    /**
     * Generate a Revenue Schedule for a transaction (e.g. Invoice Line)
     */
    static async generateSchedule(
        sourceType: string,
        sourceId: string,
        totalAmount: number,
        ruleId: string,
        startDate: Date,
        endDate?: Date // Optional, if rule is fixed duration
    ) {
        // 1. Get Rule
        const rule = await db.query.revenueRules.findFirst({
            where: eq(revenueRules.id, ruleId)
        });

        if (!rule) throw new Error(`Revenue Rule ${ruleId} not found`);

        // 2. Determine Duration and Logic
        let duration = rule.duration || 12; // Default to 12 if not specified
        if (rule.type === 'Fixed Period' && startDate && endDate) {
            // Calculate months between start and end
            // Simplified:
            duration = 1 + (endDate.getMonth() - startDate.getMonth() + (12 * (endDate.getFullYear() - startDate.getFullYear())));
        }

        if (duration <= 0) duration = 1;

        const monthlyAmount = totalAmount / duration;

        // 3. Create Schedule Header
        const [schedule] = await db.insert(revenueSchedules).values({
            sourceType,
            sourceId,
            ruleId,
            totalAmount: totalAmount.toString(),
            recognizedAmount: "0",
            status: "Active",
            startDate,
            endDate: addMonths(startDate, duration - 1)
        }).returning();

        // 4. Create Schedule Lines
        const lines = [];
        for (let i = 0; i < duration; i++) {
            const periodDate = addMonths(startDate, i);
            const periodName = format(periodDate, 'MMM-yyyy'); // e.g. Jan-2026

            // Handle rounding difference on last month
            let amount = monthlyAmount;
            if (i === duration - 1) {
                const recognizedSoFar = monthlyAmount * (duration - 1);
                amount = totalAmount - recognizedSoFar;
            }

            lines.push({
                scheduleId: schedule.id,
                periodName,
                amount: amount.toFixed(2),
                status: "Pending",
                postingDate: endOfMonth(periodDate)
            });
        }

        if (lines.length > 0) {
            await db.insert(revenueScheduleLines).values(lines);
        }

        return { schedule, lines };
    }

    /**
     * Recognize Revenue for a specific Period
     * Creates GL Journals for all pending lines in that period
     */
    static async recognizeRevenueForPeriod(periodName: string, ledgerId: string) {
        // 1. Find pending lines for this period
        const pendingLines = await db.select()
            .from(revenueScheduleLines)
            .where(and(
                eq(revenueScheduleLines.periodName, periodName),
                eq(revenueScheduleLines.status, "Pending")
            ));

        if (pendingLines.length === 0) return { count: 0, message: "No pending revenue to recognize." };

        // 2. Create GL Journal Batch
        const journalNumber = `REV-${periodName}-${Date.now()}`;

        // In a real system, we'd group by Account (Deferral vs Revenue)
        // For now, we assume a simple generic journal for all of them or one per line.
        // Let's create one BIG journal for the period.

        const [journal] = await db.insert(glJournals).values({
            journalNumber,
            ledgerId,
            periodId: periodName, // simplified linking
            source: "Revenue Recognition",
            category: "Accrual",
            description: `Revenue Recognition for ${periodName}`,
            status: "Posted", // Auto-post
            currencyCode: "USD",
            postedDate: new Date()
        }).returning();

        // 3. Create Journal Lines
        // DEBIT: Deferred Revenue (Liability)
        // CREDIT: Realized Revenue (Income)
        // We'll need default accounts. For now, using placeholders.

        let totalDr = 0;
        let totalCr = 0;

        // In a real app, these accounts come from the Source Transaction (Invoice) setup
        const deferredAccount = "2000"; // Liability
        const revenueAccount = "4000"; // Revenue

        for (const line of pendingLines) {
            const amount = Number(line.amount);

            // DB Debit
            await db.insert(glJournalLines).values({
                journalId: journal.id,
                accountId: deferredAccount, // Deferred Revenue
                enteredDebit: amount.toString(),
                enteredCredit: "0",
                accountedDebit: amount.toString(),
                accountedCredit: "0",
                description: `Rev Rec Schedule ${line.scheduleId}`
            });

            // CR Credit
            await db.insert(glJournalLines).values({
                journalId: journal.id,
                accountId: revenueAccount, // Revenue
                enteredDebit: "0",
                enteredCredit: amount.toString(),
                accountedDebit: "0",
                accountedCredit: amount.toString(),
                description: `Rev Rec Schedule ${line.scheduleId}`
            });

            totalDr += amount;
            totalCr += amount;

            // Update Line Status
            await db.update(revenueScheduleLines)
                .set({ status: "Posted", journalId: journal.id, postingDate: new Date() })
                .where(eq(revenueScheduleLines.id, line.id));

            // Update Schedule Header Recognized Amount
            // (Skipped for brevity, would usually update aggregate here)
        }

        return {
            count: pendingLines.length,
            journalNumber,
            totalAmount: totalDr
        };
    }
}

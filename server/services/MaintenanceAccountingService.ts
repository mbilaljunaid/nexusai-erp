
import { db } from "../db";
import { eq, and, sql, inArray } from "drizzle-orm";

import { maintWorkOrderCosts, glCodeCombinations } from "@shared/schema";
import { financeService } from "./finance";

export class MaintenanceAccountingService {

    /**
     * Post unposted costs for a Work Order to GL
     */
    async postWorkOrderCosts(workOrderId: string, userId: string = "system") {
        console.log(`[MAINT-ACC] Posting costs for WO ${workOrderId}...`);

        // 1. Fetch Unposted Costs
        const unpostedCosts = await db.select().from(maintWorkOrderCosts).where(
            and(
                eq(maintWorkOrderCosts.workOrderId, workOrderId),
                sql`${maintWorkOrderCosts.glJournalId} IS NULL`
            )
        );


        if (unpostedCosts.length === 0) {
            return { message: "No unposted costs found." };
        }

        // 2. Aggregate by Type (Material vs Labor)
        let totalMaterial = 0;
        let totalLabor = 0;

        unpostedCosts.forEach(c => {
            const amount = parseFloat(c.totalCost || "0");
            if (c.costType === "MATERIAL") totalMaterial += amount;
            else if (c.costType === "LABOR") totalLabor += amount;
        });

        // 3. Prepare Journal Lines
        // Hardcoded Account Mapping for Demo
        const ledgerId = "PRIMARY";
        const expenseAccount = await this.getOrCreateAccount(ledgerId, "01-000-5000-000"); // Maintenance Expense
        const inventoryAccount = await this.getOrCreateAccount(ledgerId, "01-000-1000-000"); // Inventory Asset
        const laborAbsorbAccount = await this.getOrCreateAccount(ledgerId, "01-000-2000-000"); // Labor Liability

        const lines = [];

        // Debit Maintenance Expense (Material + Labor)
        const totalExpense = totalMaterial + totalLabor;
        if (totalExpense > 0) {
            lines.push({
                accountId: expenseAccount, // Resolved CCID
                debit: totalExpense.toFixed(2),
                credit: "0",
                description: `Maintenance Expense for WO ${workOrderId}`,
                currencyCode: "USD"
            });
        }

        // Credit Inventory (Material)
        if (totalMaterial > 0) {
            lines.push({
                accountId: inventoryAccount,
                debit: "0",
                credit: totalMaterial.toFixed(2),
                description: `Material Issue for WO ${workOrderId}`,
                currencyCode: "USD"
            });
        }

        // Credit Labor Absorption (Labor)
        if (totalLabor > 0) {
            lines.push({
                accountId: laborAbsorbAccount,
                debit: "0",
                credit: totalLabor.toFixed(2),
                description: `Labor Absorption for WO ${workOrderId}`,
                currencyCode: "USD"
            });
        }

        // 4. Create Journal
        if (lines.length > 0) {
            // Find an open period
            const periods = await financeService.listPeriods(ledgerId);
            const openPeriod = periods.find(p => p.status === "Open");
            // If no open period, fallback or error? For demo, use first or create/mock.
            const periodId = openPeriod?.id;

            const journal = await financeService.createJournal({
                ledgerId,
                journalNumber: `MAINT-${workOrderId}-${Date.now()}`,
                description: `Maintenance Costs for WO ${workOrderId}`,
                source: "Maintenance",
                currencyCode: "USD",
                status: "Posted", // We request Auto-post
                periodId
            }, lines, userId);

            // 5. Update Costs with Journal ID
            const costIds = unpostedCosts.map(c => c.id);
            await db.update(maintWorkOrderCosts)
                .set({
                    glJournalId: journal.id,
                    postedAt: new Date()
                })
                .where(inArray(maintWorkOrderCosts.id, costIds));

            return { success: true, journalId: journal.id, linesPosted: lines.length };
        }

        return { message: "No net impact to post." };
    }

    /**
     * Helper to get CCID for demo
     */
    private async getOrCreateAccount(ledgerId: string, code: string): Promise<string> {
        // Check exact match
        const [existing] = await db.select().from(glCodeCombinations).where(
            and(eq(glCodeCombinations.code, code), eq(glCodeCombinations.ledgerId, ledgerId))
        );
        if (existing) return existing.id;

        // Create if missing
        const parts = code.split("-");
        const [newAcc] = await db.insert(glCodeCombinations).values({
            code,
            ledgerId,
            segment1: parts[0],
            segment2: parts[1],
            segment3: parts[2],
            segment4: parts[3],
            enabledFlag: true
        }).returning();
        return newAcc.id;
    }
}

export const maintenanceAccountingService = new MaintenanceAccountingService();


import { db } from "@db";
import { lcmTradeOperations, lcmAllocations, lcmShipmentLines, lcmCharges, lcmCostComponents } from "@shared/schema/lcm";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema/sla";
import { glLedgers } from "@shared/schema/finance";
import { eq, sql, and } from "drizzle-orm";

export class LcmAccountingService {

    /**
     * Generates SLA Journals for a finalized Trade Operation.
     * 1. Absorption Journal: Dr Inventory / Cr Absorption (for Estimated Costs)
     * 2. Variance Journal: Dr/Cr Variance / Cr/Dr Absorption (for Actual vs Estimate difference)
     */
    async createAccounting(tradeOpId: string) {
        return await db.transaction(async (tx) => {
            // 1. Validate Trade Op
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, tradeOpId));
            if (!op) throw new Error("Trade Operation not found");

            // 2. Fetch Allocations joined with Cost Components to get Accounts
            // We need to group by Cost Component to create summary lines per Account
            const allocations = await tx.select({
                amount: lcmAllocations.amount,
                variance: lcmAllocations.varianceAmount,
                absorptionAccount: lcmCostComponents.absorptionAccountCcid,
                varianceAccount: lcmCostComponents.varianceAccountCcid,
                componentName: lcmCostComponents.name
            })
                .from(lcmAllocations)
                .innerJoin(lcmCharges, eq(lcmAllocations.chargeId, lcmCharges.id))
                .innerJoin(lcmCostComponents, eq(lcmCharges.costComponentId, lcmCostComponents.id))
                .where(eq(lcmCharges.tradeOperationId, tradeOpId));

            if (allocations.length === 0) throw new Error("No allocations found to account for.");

            // 3. Get Default Ledger
            const [ledger] = await tx.select().from(glLedgers).limit(1);
            if (!ledger) throw new Error("No General Ledger defined in system.");

            // 4. Create Header (Absorption)
            const [header] = await tx.insert(slaJournalHeaders).values({
                ledgerId: ledger.id,
                entityId: tradeOpId,
                entityTable: 'lcm_trade_operations',
                eventClassId: 'LCM_ABSORPTION',
                eventDate: new Date(),
                glDate: new Date(),
                currencyCode: 'USD',
                description: `Landed Cost Absorption for ${op.operationNumber}`,
                status: 'Draft'
            }).returning();

            // 5. Generate Lines
            let lineNumber = 1;
            let totalDebits = 0;

            // Group by Absorption Account
            const absorptionMap = new Map<string, number>();
            let totalInventoryAdd = 0;

            for (const alloc of allocations) {
                const amount = Number(alloc.amount || 0);
                const acct = alloc.absorptionAccount || 'DEFAULT_ABSORPTION'; // Fallback

                totalInventoryAdd += amount;
                absorptionMap.set(acct, (absorptionMap.get(acct) || 0) + amount);
            }

            // Line 1: Debit Inventory (Summary of all Allocations)
            // Ideally we debit specific Inventory Valuation accounts per Item, but for LCM-SLA MVP we debit a control account
            await tx.insert(slaJournalLines).values({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: 'Inventory Valuation',
                enteredDr: totalInventoryAdd.toFixed(2),
                currencyCode: 'USD',
                description: 'Landed Cost Capitalization'
            });

            // Lines 2..N: Credit Absorption Accounts (per Component)
            for (const [acct, amount] of absorptionMap.entries()) {
                await tx.insert(slaJournalLines).values({
                    headerId: header.id,
                    lineNumber: lineNumber++,
                    accountingClass: 'LCM Absorption',
                    accountId: acct !== 'DEFAULT_ABSORPTION' ? acct : undefined, // Only set if valid UUID/CCID
                    enteredCr: amount.toFixed(2),
                    currencyCode: 'USD',
                    description: `Absorption for ${acct}`
                });
            }

            // 6. Handle Variance (If Variance Amounts exist)
            const totalVariance_Abs = allocations.reduce((sum, a) => sum + Math.abs(Number(a.variance || 0)), 0);

            if (totalVariance_Abs > 0.01) {
                // Create Variance Journal
                const [varHeader] = await tx.insert(slaJournalHeaders).values({
                    ledgerId: ledger.id,
                    entityId: tradeOpId,
                    entityTable: 'lcm_trade_operations',
                    eventClassId: 'LCM_VARIANCE',
                    eventDate: new Date(),
                    glDate: new Date(),
                    currencyCode: 'USD',
                    description: `Landed Cost Variance for ${op.operationNumber}`,
                    status: 'Draft'
                }).returning();

                let varLineNum = 1;

                // Group Variances
                // If Variance > 0 (Actual > Est) -> Dr Variance / Cr Absorption (or Clearing)
                // If Variance < 0 (Est > Actual) -> Dr Absorption / Cr Variance
                // Note: Logic depends on how 'varianceAmount' is calculated. Assuming (Actual - Estimate).

                for (const alloc of allocations) {
                    const variance = Number(alloc.variance || 0);
                    if (Math.abs(variance) < 0.01) continue;

                    const varAcct = alloc.varianceAccount || 'DEFAULT_VARIANCE';
                    const absAcct = alloc.absorptionAccount || 'DEFAULT_ABSORPTION';

                    if (variance > 0) {
                        // Under-estimated: Need to expense the difference
                        // Dr Variance Expense
                        await tx.insert(slaJournalLines).values({
                            headerId: varHeader.id,
                            lineNumber: varLineNum++,
                            accountingClass: 'LCM Variance',
                            accountId: varAcct !== 'DEFAULT_VARIANCE' ? varAcct : undefined,
                            enteredDr: variance.toFixed(2),
                            currencyCode: 'USD',
                            description: `Variance (Under-absorbed) - ${alloc.componentName}`
                        });
                        // Cr Absorption (to offset the AP Invoice which debited Absorption/Clearing)
                        // Wait, AP Invoice usually debits a Clearing account. 
                        // If we credited Absorption in step 1, we now need to credit it MORE? 
                        // No, Absorption is a contra-asset.
                        // Standard Flow:
                        // 1. Receipt: Dr Inventory / Cr Accrual (Material)
                        // 2. LCM Absorption: Dr Inventory / Cr LCA Clearing ($100)
                        // 3. AP Invoice: Dr LCA Clearing ($120) / Cr Liability ($120)
                        // Net in Clearing: Dr 120, Cr 100 = Dr 20 Balance (Mismatch!)
                        // We need to Credit Clearing $20 to zero it out, and Debit Variance $20.

                        // So: Dr Variance / Cr Absorption (Clearing)
                        await tx.insert(slaJournalLines).values({
                            headerId: varHeader.id,
                            lineNumber: varLineNum++,
                            accountingClass: 'LCM Absorption',
                            accountId: absAcct !== 'DEFAULT_ABSORPTION' ? absAcct : undefined,
                            enteredCr: variance.toFixed(2),
                            currencyCode: 'USD',
                            description: `Clearing Offset`
                        });

                    } else {
                        // Over-estimated: Need to reduce expense/gain
                        // Variance is negative (e.g. -20). Actual ($80) < Est ($100).
                        // Clearing has: Cr 100 (Est), Dr 80 (AP). Net Cr 20.
                        // We need to Debit Clearing 20 to zero it. Credit Variance (Gain).

                        const absVal = Math.abs(variance);
                        await tx.insert(slaJournalLines).values({
                            headerId: varHeader.id,
                            lineNumber: varLineNum++,
                            accountingClass: 'LCM Absorption',
                            accountId: absAcct !== 'DEFAULT_ABSORPTION' ? absAcct : undefined,
                            enteredDr: absVal.toFixed(2),
                            currencyCode: 'USD',
                            description: `Clearing Offset`
                        });

                        await tx.insert(slaJournalLines).values({
                            headerId: varHeader.id,
                            lineNumber: varLineNum++,
                            accountingClass: 'LCM Variance',
                            accountId: varAcct !== 'DEFAULT_VARIANCE' ? varAcct : undefined,
                            enteredCr: absVal.toFixed(2),
                            currencyCode: 'USD',
                            description: `Variance (Over-absorbed) - ${alloc.componentName}`
                        });
                    }
                }
                return { success: true, journalIds: [header.id, varHeader.id], totalAmount: totalInventoryAdd };
            }

            return { success: true, journalIds: [header.id], totalAmount: totalInventoryAdd };
        });
    }
}

export const lcmAccountingService = new LcmAccountingService();

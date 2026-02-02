import { db } from "../db";
import { icAllocationRules, icAllocationLines, icBatches, icHeaders } from "@shared/schema/intercompany";
import { eq } from "drizzle-orm";
import { intercompanyService } from "../modules/intercompany/intercompany.service"; // Reuse batch creation

export class AllocationService {

    // 1. Create Rule
    async createRule(data: {
        name: string;
        description?: string;
        sourceOrgId: string;
        allocationMethod: string;
        lines: { targetOrgId: string; percentage?: string; fixedAmount?: string }[]
    }) {
        return await db.transaction(async (tx) => {
            const [rule] = await tx.insert(icAllocationRules).values({
                name: data.name,
                description: data.description,
                sourceOrgId: data.sourceOrgId,
                allocationMethod: data.allocationMethod
            }).returning();

            if (data.lines && data.lines.length > 0) {
                await tx.insert(icAllocationLines).values(
                    data.lines.map(line => ({
                        ruleId: rule.id,
                        targetOrgId: line.targetOrgId,
                        percentage: line.percentage,
                        fixedAmount: line.fixedAmount
                    }))
                );
            }
            return rule;
        });
    }

    // 2. Get Rules
    async getRules() {
        // Fetch rules with their lines
        const rules = await db.select().from(icAllocationRules);
        const results = [];

        for (const rule of rules) {
            const lines = await db.select().from(icAllocationLines).where(eq(icAllocationLines.ruleId, rule.id));
            results.push({ ...rule, lines });
        }
        return results;
    }

    // 3. Execute Allocation (Run)
    // Generates an IC Batch based on the rule
    // For simplicity, we assume "Source Amount" is passed in (e.g. Total IT Cost for the month).
    // In a real system, this might query GL Balances.
    async runAllocation(ruleId: string, amountToAllocate: number, currency: string, userId: string) {
        const rules = await db.select().from(icAllocationRules).where(eq(icAllocationRules.id, ruleId));
        if (rules.length === 0) throw new Error("Rule not found");
        const rule = rules[0];

        const lines = await db.select().from(icAllocationLines).where(eq(icAllocationLines.ruleId, ruleId));

        // Prepare Batch Data for IntercompanyService
        const transactions = lines.map(line => {
            let allocatedAmount = 0;
            if (rule.allocationMethod === "PERCENTAGE") {
                allocatedAmount = amountToAllocate * (Number(line.percentage) / 100);
            } else {
                allocatedAmount = Number(line.fixedAmount);
            }

            return {
                providerOrgId: rule.sourceOrgId,
                receiverOrgId: line.targetOrgId,
                amount: allocatedAmount,
                currencyCode: currency,
                transactionTypeId: "Allocation", // Need to ensure this exists or use generic
                description: `Allocation Run: ${rule.name}`
            };
        });

        // Use core service to create the batch
        // We reuse the existing createBatch method which handles validations
        const batchData = {
            description: `Auto-Allocation: ${rule.name}`,
            currencyCode: currency,
            transactions
        };

        return await intercompanyService.createBatch(batchData as any, userId);
    }
}

export const allocationService = new AllocationService();

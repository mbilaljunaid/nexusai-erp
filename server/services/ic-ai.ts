
import { db } from "../db";
import { icBatches, icHeaders, icTransferPricingRules } from "@shared/schema/intercompany";
import { eq, and, gt, desc } from "drizzle-orm";

export interface AnomalyResult {
    hasAnomaly: boolean;
    riskScore: number; // 0-100
    flags: string[];
}

export class IntercompanyAiService {

    // Detect Anomalies for a proposed batch
    async detectAnomalies(batchData: {
        totalAmount: number,
        currencyCode: string,
        transactions: any[]
    }): Promise<AnomalyResult> {
        const flags: string[] = [];
        let riskScore = 0;

        // Rule 1: High Value Threshold test (> 1M)
        if (Number(batchData.totalAmount) > 1000000) {
            flags.push("HIGH_VALUE_BATCH");
            riskScore += 40;
        }

        // Rule 2: Unusual Currency (if not USD/EUR/GBP for simplicity, or check past history)
        if (!["USD", "EUR", "GBP"].includes(batchData.currencyCode)) {
            flags.push("UNUSUAL_CURRENCY");
            riskScore += 10;
        }

        // Rule 3: Transaction Level Checks
        for (const txn of batchData.transactions) {
            // 3a. Unauthorized Pair Check
            // Check if a TP rule exists for this pair. If not, it might be unusual.
            const rules = await db.select().from(icTransferPricingRules)
                .where(and(
                    eq(icTransferPricingRules.providerOrgId, txn.providerOrgId),
                    eq(icTransferPricingRules.receiverOrgId, txn.receiverOrgId)
                ));

            if (rules.length === 0) {
                flags.push(`UNAUTHORIZED_PAIR: ${txn.providerOrgId} -> ${txn.receiverOrgId}`);
                riskScore += 25;
            }

            // 3b. Large Single Transaction (> 500k)
            if (Number(txn.amount) > 500000) {
                flags.push(`HIGH_VALUE_TXN: ${txn.amount} ${batchData.currencyCode}`);
                riskScore += 20;
            }
        }

        // Rule 4: Duplicate Batch Check (Heuristic: Same Amount in last 24h)
        // Check recent batches
        const recentBatches = await db.select().from(icBatches)
            .orderBy(desc(icBatches.createdAt))
            .limit(5); // Check last 5

        for (const recent of recentBatches) {
            if (Number(recent.totalAmount) === Number(batchData.totalAmount) && recent.currencyCode === batchData.currencyCode) {
                flags.push(`POTENTIAL_DUPLICATE_BATCH: Matches Batch ${recent.batchNumber}`);
                riskScore += 50;
            }
        }

        return {
            hasAnomaly: riskScore > 30, // Threshold
            riskScore: Math.min(riskScore, 100),
            flags
        };
    }
}

export const icAiService = new IntercompanyAiService();


import { db } from "../../db";
import { icAllocationRules, icAllocationLines } from "../../../shared/schema/intercompany";
import { glPeriods, glJournals, glJournalLines, glCodeCombinations } from "../../../shared/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { financeService } from "../../services/finance";

export const allocationsService = {
    // 1. Create Rule
    async createRule(data: any) {
        const [rule] = await db.insert(icAllocationRules).values({
            name: data.name,
            description: data.description,
            sourceOrgId: data.sourceOrgId,
            allocationMethod: data.allocationMethod,
            status: data.status,
        }).returning();
        return rule;
    },

    // 2. Get Rules
    async getRules() {
        return await db.select().from(icAllocationRules);
    },

    // 3. Get Rule by ID
    async getRule(id: string) {
        const [rule] = await db.select().from(icAllocationRules).where(eq(icAllocationRules.id, id));
        return rule;
    },

    // 4. Update Rule
    async updateRule(id: string, data: any) {
        const [rule] = await db.update(icAllocationRules)
            .set(data)
            .where(eq(icAllocationRules.id, id))
            .returning();
        return rule;
    },

    // 5. Delete Rule
    async deleteRule(id: string) {
        return await db.transaction(async (tx) => {
            await tx.delete(icAllocationLines).where(eq(icAllocationLines.ruleId, id));
            await tx.delete(icAllocationRules).where(eq(icAllocationRules.id, id));
        });
    },

    // 6. Generate Allocation Run (Engine)
    async generateAllocationRun(ruleId: string, periodName: string) {
        const rule = await this.getRule(ruleId);
        if (!rule) throw new Error("Rule not found");

        console.log(`[ALLOCATION] Running Rule: ${rule.name} for ${periodName}`);

        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, periodName));
        if (!period) throw new Error(`Period ${periodName} not found`);
        const periodId = period.id;

        // Helper to get CCIDs matching filter
        const getCcids = async (segmentCol: string, value: string) => {
            return await db.select().from(glCodeCombinations)
                .where(eq(glCodeCombinations[segmentCol as keyof typeof glCodeCombinations], value));
        };

        // --- POOL ---
        const poolCcids = await getCcids("segment3", "6000"); // Rent
        const poolCcidIds = poolCcids.map((c: any) => c.id);

        if (poolCcidIds.length === 0) {
            console.warn("[ALLOCATION] No pool accounts found.");
            return { success: false, message: "No pool accounts found" };
        }

        const poolLinesToCheck = await db.select({
            enteredDebit: glJournalLines.enteredDebit,
            enteredCredit: glJournalLines.enteredCredit
        }).from(glJournalLines)
            .leftJoin(glJournals, eq(glJournalLines.journalId, glJournals.id))
            .where(and(
                inArray(glJournalLines.accountId, poolCcidIds),
                eq(glJournals.periodId, periodId),
                eq(glJournals.status, "Posted")
            ));

        let poolAmount = 0;
        for (const line of poolLinesToCheck) {
            const dr = Number(line.enteredDebit || 0);
            const cr = Number(line.enteredCredit || 0);
            poolAmount += (dr - cr);
        }
        console.log(`[ALLOCATION] Pool Amount: ${poolAmount}`);

        if (poolAmount === 0) {
            return { success: false, message: "Pool amount is zero" };
        }

        // --- BASIS ---
        const basisCcids = await getCcids("segment3", "HC");
        const basisCcidIds = basisCcids.map((c: any) => c.id);
        console.log(`[ALLOCATION] Found ${basisCcidIds.length} basis accounts matching HC`);

        if (basisCcidIds.length === 0) {
            console.warn("[ALLOCATION] No basis accounts found (HC).");
            return { success: false, message: "No basis accounts found" };
        }

        const basisLines = await db.select({
            accountId: glJournalLines.accountId,
            enteredDebit: glJournalLines.enteredDebit,
            enteredCredit: glJournalLines.enteredCredit
        }).from(glJournalLines)
            .leftJoin(glJournals, eq(glJournalLines.journalId, glJournals.id))
            .where(and(
                inArray(glJournalLines.accountId, basisCcidIds),
                eq(glJournals.periodId, periodId),
                eq(glJournals.status, "Posted")
                // Removed category check as it doesn't exist on glJournals header
            ));

        // Group Basis by Dept (Segment2)
        const basisValues = new Map<string, number>();
        let totalBasis = 0;

        for (const line of basisLines) {
            const val = Number(line.enteredDebit || 0) - Number(line.enteredCredit || 0);
            const ccid = basisCcids.find((c: any) => c.id === line.accountId);
            if (ccid) {
                const dept = ccid.segment2;
                const current = basisValues.get(dept) || 0;
                basisValues.set(dept, current + val);
                totalBasis += val;
            }
        }

        console.log(`[ALLOCATION] Total Basis: ${totalBasis}`);
        if (totalBasis === 0) return { success: false, message: "Zero Basis" };

        // --- CREATE JOURNAL ---
        const linesToCreate: any[] = [];

        for (const [dept, basisVal] of basisValues.entries()) {
            const ratio = basisVal / totalBasis;
            const allocatedAmt = poolAmount * ratio;

            const targetCode = `01-${dept}-6000-000`;
            const [targetCcid] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, targetCode));

            if (targetCcid) {
                linesToCreate.push({
                    accountId: targetCcid.id,
                    enteredDebit: allocatedAmt.toFixed(2),
                    enteredCredit: 0,
                    description: `Allocated Rent for Dept ${dept}`
                });
            } else {
                console.warn(`[ALLOCATION] Missing target account ${targetCode}`);
            }
        }

        const [offsetCcid] = await db.select().from(glCodeCombinations).where(eq(glCodeCombinations.code, "01-000-6000-000"));
        if (offsetCcid) {
            linesToCreate.push({
                accountId: offsetCcid.id,
                enteredDebit: 0,
                enteredCredit: poolAmount.toFixed(2),
                description: "Allocation Offset"
            });
        }

        const journal = await financeService.createJournal({
            journalNumber: "ALLOC-" + Date.now(),
            description: `Allocation Run: ${rule.name}`,
            ledgerId: "primary-ledger-001",
            periodId: periodId,
            currencyCode: "USD",
            source: "Allocation",
            category: "Allocation",
            status: "Posted"
        }, linesToCreate, "system");

        return { success: true, journalId: journal.id, totalAllocated: poolAmount };
    }
};

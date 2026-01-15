
import { db } from "../db";
import { eq } from "drizzle-orm";
import { maintWorkOrderCosts, slaJournalHeaders, slaJournalLines, glLedgers, glCodeCombinations } from "@shared/schema";

export class MaintenanceAccountingService {

    /**
     * Create Accounting for a Cost Record (Material or Labor)
     * Triggers SLA Interface to create Journals
     */
    async createAccountingForCost(costId: string) {
        console.log(`🧾 Creating Accounting for Cost ID: ${costId}`);

        // 1. Fetch Cost Record
        const cost = await db.query.maintWorkOrderCosts.findFirst({
            where: eq(maintWorkOrderCosts.id, costId),
            with: {
                workOrder: true
            }
        });

        if (!cost) throw new Error(`Cost not found: ${costId}`);
        if (cost.glStatus === 'POSTED') {
            console.log("Skipping, already accounted.");
            return;
        }


        // 2. Fetch Primary Ledger (Mock: "1" or first available)
        // In real world, we get from Org -> Ledger
        // We'll query glLedgers.
        const ledger = await db.query.glLedgers.findFirst();
        if (!ledger) throw new Error("No GL Ledger defined in system.");

        // 3. Determine Accounts (Hardcoded for MVP Parity)
        // Ideally comes from SLA Rules Engine
        let drAccount = "";
        let crAccount = "";
        let eventClass = "";

        if (cost.costType === "MATERIAL") {
            eventClass = "MAINT_MATERIAL_ISSUE";
            drAccount = "6000-000-M-EXP"; // Maintenance Expense
            crAccount = "1200-000-INV";   // Inventory Asset
        } else if (cost.costType === "LABOR") {
            eventClass = "MAINT_RESOURCE_CHARGING";
            drAccount = "6000-000-L-EXP"; // Maintenance Labor Expense
            crAccount = "5000-000-ABS";   // Labor Absorption
        } else {
            console.warn("Unknown cost type for accounting:", cost.costType);
            return;
        }

        // 4. Resolve CCIDs (Mock resolution or simple lookup)
        // We'll create or find these CCIDs. For this script, we'll assume we pass the raw code
        // But the schema requires `code_combination_id`. 
        // Let's assume we find/create them.
        const drCcid = await this.getOrCreateCcid(drAccount, ledger.id);
        const crCcid = await this.getOrCreateCcid(crAccount, ledger.id);


        // 5. Create SLA Journal
        // Header
        const [header] = await db.insert(slaJournalHeaders).values({
            ledgerId: ledger.id,
            eventClassId: eventClass,
            entityId: cost.id,
            entityTable: "maint_work_order_costs",
            eventDate: new Date(),
            glDate: new Date(),
            currencyCode: "USD", // Default
            status: "Final",
            description: `Auto-Accounting for WO: ${cost.workOrder?.workOrderNumber} - ${cost.description}`
        }).returning();

        // Lines
        const amount = cost.totalCost || "0";

        // Debit Line
        await db.insert(slaJournalLines).values({
            headerId: header.id,
            lineNumber: 1,
            accountingClass: "EXPENSE",
            codeCombinationId: drCcid,
            enteredDr: amount,
            accountedDr: amount,
            currencyCode: "USD",
            description: cost.description
        });

        // Credit Line
        await db.insert(slaJournalLines).values({
            headerId: header.id,
            lineNumber: 2,
            accountingClass: "ACCRUAL", // or ASSET
            codeCombinationId: crCcid,
            enteredCr: amount,
            accountedCr: amount,
            currencyCode: "USD",
            description: "Offset Account"
        });

        // 6. Update Cost Status
        await db.update(maintWorkOrderCosts)
            .set({ glStatus: "POSTED" })
            .where(eq(maintWorkOrderCosts.id, cost.id));


        console.log(`✅ Journal Created: ${header.id}`);
    }

    // Helper to mock CCID fetch
    async getOrCreateCcid(code: string, ledgerId: string) {
        // Try find
        const found = await db.query.glCodeCombinations.findFirst({
            where: eq(glCodeCombinations.code, code)
        });
        if (found) return found.id;

        // Create
        const [neu] = await db.insert(glCodeCombinations).values({
            ledgerId,
            code,
            segment1: code.split('-')[0],
            accountType: "EXPENSE", // Simplified
            enabledFlag: true
        }).returning();
        return neu.id;
    }
}

export const maintenanceAccountingService = new MaintenanceAccountingService();

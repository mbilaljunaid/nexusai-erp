
import "dotenv/config";
import { db } from "../server/db";
import { icOrgs, icTransactionTypes } from "../shared/schema/intercompany";
import { glCodeCombinations } from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function seedIntercompanyData() {
    console.log("🌱 Seeding Intercompany (AGIS) Data...");

    // 1. Transaction Types
    console.log("   - Seeding Transaction Types...");
    const types = [
        { id: "SHARED_SERVICES", typeName: "Shared Services", description: "Allocation of HQ costs", requiresApproval: true, requiresInvoicing: true },
        { id: "INVENTORY", typeName: "Inventory Transfer", description: "Stock movement between orgs", requiresApproval: false, requiresInvoicing: true },
        { id: "ROYALTY", typeName: "Royalty Fee", description: "IP Usage Fees", requiresApproval: true, requiresInvoicing: true },
        { id: "MANUAL", typeName: "Manual Adjustment", description: "Ad-hoc corrections", requiresApproval: true, requiresInvoicing: false }
    ];

    for (const t of types) {
        await db.insert(icTransactionTypes).values(t).onConflictDoUpdate({ target: icTransactionTypes.id, set: t });
    }

    // 2. Intercompany Organizations
    // For simplicity, we assume LE-101 and LE-102 exist or we map artificially properly.
    // We need Receivables/Payables CCIDs. 
    // Format: Company-Loc-Acct-Dept-Metric
    // Due From (Asset): 1200
    // Due To (Liability): 2200

    // Ensure CCIDs exist (Mocking for now if not present, but using valid structure)
    // IC Org 101 (HQ)
    const hqRec = "101-000-1200-000-000";
    const hqPay = "101-000-2200-000-000";

    // IC Org 102 (Subsidiary)
    const subRec = "102-000-1200-000-000";
    const subPay = "102-000-2200-000-000";

    console.log("   - Seeding IC Organizations...");
    const orgs = [
        {
            id: "ICO-101",
            orgName: "Nexus HQ (US)",
            legalEntityId: "LE-101",
            ledgerId: "PRIMARY",
            companySegment: "101",
            receivablesAccountId: hqRec,
            payablesAccountId: hqPay
        },
        {
            id: "ICO-102",
            orgName: "Nexus Europe (EU)",
            legalEntityId: "LE-102",
            ledgerId: "SECONDARY",
            companySegment: "102",
            receivablesAccountId: subRec,
            payablesAccountId: subPay
        }
    ];

    for (const o of orgs) {
        await db.insert(icOrgs).values(o).onConflictDoUpdate({ target: icOrgs.id, set: o });
    }

    console.log("✅ Intercompany Data Seeded.");
    process.exit(0);
}

seedIntercompanyData().catch((err) => {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
});

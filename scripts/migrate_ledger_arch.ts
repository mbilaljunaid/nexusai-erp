
import "dotenv/config"; // Load env vars first
import { db } from "../server/db";
import { glPeriods, glLegalEntities, glLedgerRelationships, glLedgers } from "../shared/schema/finance";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("🚀 Starting Ledger Architecture Migration...");

    try {
        // 1. Ensure gl_ledgers has at least the PRIMARY ledger
        console.log("📝 Checking Primary Ledger...");
        const existingLedgers = await db.select().from(glLedgers);
        let primaryLedgerId = "PRIMARY";

        if (existingLedgers.length === 0) {
            console.log("➕ Creating default PRIMARY ledger...");
            const [newLedger] = await db.insert(glLedgers).values({
                id: "PRIMARY",
                name: "Primary Ledger",
                currencyCode: "USD",
                ledgerCategory: "PRIMARY"
            }).returning();
            primaryLedgerId = newLedger.id;
        } else {
            primaryLedgerId = existingLedgers[0].id;
        }

        // 2. Backfill glPeriods with ledgerId
        console.log("🔄 Backfilling glPeriods with ledgerId...");
        await db.execute(sql`
            UPDATE gl_periods 
            SET ledger_id = ${primaryLedgerId} 
            WHERE ledger_id IS NULL OR ledger_id = ''
        `);

        // 3. Create a default Legal Entity if none exists
        console.log("📝 Checking Legal Entities...");
        const existingEntities = await db.select().from(glLegalEntities);
        if (existingEntities.length === 0) {
            console.log("➕ Creating default Legal Entity...");
            await db.insert(glLegalEntities).values({
                name: "NexusAI Corporate",
                taxId: "TX-999-001",
                ledgerId: primaryLedgerId
            });
        }

        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();

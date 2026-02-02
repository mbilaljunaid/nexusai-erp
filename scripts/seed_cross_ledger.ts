
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { financeService } from "../server/modules/finance/finance.service";

async function main() {
    console.log("🌍 Seeding Multi-Ledger Intercompany Data...");

    // 1. Ensure Ledgers exist (mocking if not present in GL module yet)
    // We assume Ledger '1' (US Primary) and '2' (UK Primary)

    // 2. Create/Update Intercompany Orgs
    console.log("Upserting ICO-101 (US) and ICO-103 (UK)...");



    // Ledger UUIDs
    const LEDGER_US = "ff74def3-c9ee-46b1-b2b0-82432adf33dc";
    const LEDGER_UK = "28281957-a9e7-4868-997a-3c26f297b0c6";

    // Prepare Account CCIDs
    console.log("Creating/Fetching Default Intercompany Accounts...");
    const usReceivable = await financeService.getOrCreateCodeCombination(LEDGER_US, "101-000-12999-000-000-000-000-000-000-000");
    const ukPayable = await financeService.getOrCreateCodeCombination(LEDGER_UK, "103-000-22999-000-000-000-000-000-000-000");

    // US Entity (Provider) -> PRIMARY_ML_TEST (USD)
    await db.execute(sql`
        INSERT INTO ic_orgs (id, org_name, legal_entity_id, ledger_id, company_segment, enabled, receivables_account_id)
        VALUES ('ICO-101', 'Nexus US Ops', 'LE-101', ${LEDGER_US}, '101', true, ${usReceivable.id})
        ON CONFLICT (id) DO UPDATE 
        SET ledger_id = ${LEDGER_US}, company_segment = '101', receivables_account_id = ${usReceivable.id};
    `);

    // UK Entity (Receiver) -> SECONDARY_EUR_TEST (EUR)
    await db.execute(sql`
        INSERT INTO ic_orgs (id, org_name, legal_entity_id, ledger_id, company_segment, enabled, payables_account_id)
        VALUES ('ICO-103', 'Nexus UK Ops', 'LE-103', ${LEDGER_UK}, '103', true, ${ukPayable.id})
        ON CONFLICT (id) DO UPDATE 
        SET ledger_id = ${LEDGER_UK}, company_segment = '103', payables_account_id = ${ukPayable.id};
    `);

    // 3. Create TP Rule for US -> UK
    console.log("Seeding TP Rule for US -> UK...");
    await db.execute(sql`
        INSERT INTO ic_transfer_pricing_rules (provider_org_id, receiver_org_id, markup_type, markup_value, description)
        VALUES ('ICO-101', 'ICO-103', 'PERCENTAGE', 0.2000, 'US to UK Services')
        ON CONFLICT DO NOTHING;
    `);

    console.log("✅ Multi-Ledger Seed Completed.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed Failed:", err);
    process.exit(1);
});

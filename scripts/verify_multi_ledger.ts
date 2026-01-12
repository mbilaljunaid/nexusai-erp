
import "dotenv/config";
import { financeService } from "../server/services/finance";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { glLedgers, glLegalEntities, glLedgerRelationships, glPeriods } from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function verifyMultiLedger() {
    console.log("🚀 Starting Multi-Ledger Verification...");

    try {
        // 1. Verify Primary Ledger (should exist from migration)
        console.log("🔍 Verifying Primary Ledger...");
        const ledgers = await financeService.listLedgers();
        const primary = ledgers.find(l => l.ledgerCategory === 'PRIMARY');
        if (!primary) throw new Error("Primary Ledger not found!");
        console.log("✅ Primary Ledger found:", primary.name);
        // 2. Create Secondary Ledger
        console.log("➕ Creating Secondary Ledger...");
        const existingSec = ledgers.find(l => l.name === "IFRS Secondary Ledger");
        if (existingSec) {
            // Clean up if exists
            // We can't easily delete via financeService (no deleteLedger exposed?), so we'll skip or use raw DB delete if possible or just use existing
            console.log("Secondary ledger already exists, using it:", existingSec.id);
            // We might need to ensure legal entity and relationship don't conflict either
            // Ideally we run a cleanup at start of script using direct DB access
            await db.delete(glLedgers).where(eq(glLedgers.name, "IFRS Secondary Ledger"));
            console.log("Deleted existing secondary ledger for clean test.");
        }

        const secondary = await financeService.createLedger({
            name: "IFRS Secondary Ledger",
            currencyCode: "EUR",
            ledgerCategory: "SECONDARY",
            description: "IFRS Reporting Layer",
            isActive: true
        });
        console.log("✅ Secondary Ledger created:", secondary.id);

        // 3. Create Legal Entity
        console.log("➕ Creating Legal Entity for Primary Ledger...");
        const existingLE = await db.select().from(glLegalEntities).where(eq(glLegalEntities.name, "NexusAI UK Operations"));
        if (existingLE.length > 0) {
            await db.delete(glLegalEntities).where(eq(glLegalEntities.name, "NexusAI UK Operations"));
            console.log("Deleted existing legal entity.");
        }

        const legalEntity = await financeService.createLegalEntity({
            name: "NexusAI UK Operations",
            taxId: "GB-VAT-888",
            ledgerId: primary.id,
            isActive: true
        });
        console.log("✅ Legal Entity verified:", legalEntity.id);

        // 4. Create Ledger Relationship
        console.log("🔗 Creating Ledger Relationship...");
        const relationship = await financeService.createLedgerRelationship({
            primaryLedgerId: primary.id,
            secondaryLedgerId: secondary.id,
            relationshipType: "SECONDARY",
            conversionLevel: "JOURNAL",
            isActive: true
        });
        console.log("✅ Relationship established:", relationship.id);

        // 5. Verify Period Filtering
        console.log("📅 Verifying Period Filtering...");
        const primaryPeriods = await financeService.listPeriods(primary.id);
        const secondaryPeriods = await financeService.listPeriods(secondary.id);

        console.log(`info: Primary Periods: ${primaryPeriods.length}`);
        console.log(`info: Secondary Periods: ${secondaryPeriods.length}`);

        if (primaryPeriods.length === 0) console.warn("⚠️ No periods found for Primary Ledger (Migration might strictly require existing periods)");
        if (secondaryPeriods.length > 0) throw new Error("Secondary Ledger should not have periods yet!");

        console.log("✅ Verification Suite Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyMultiLedger();

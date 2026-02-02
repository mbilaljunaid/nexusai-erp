
import { db } from "@db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes } from "@shared/schema/sla";
import { eq } from "drizzle-orm";

async function seedFixedAssetsSla() {
    console.log("🌱 Seeding Fixed Assets SLA Metadata...");

    // 1. Event Classes
    const eventClasses = [
        { id: "FA_ADDITION", name: "Asset Addition", applicationId: "FA", module: "FA" },
        { id: "FA_DEPRECIATION", name: "Depreciation", applicationId: "FA", module: "FA" },
        { id: "FA_RETIREMENT", name: "Asset Retirement", applicationId: "FA", module: "FA" }
    ];

    for (const ec of eventClasses) {
        await db.insert(slaEventClasses).values(ec).onConflictDoNothing();
        console.log(`   - Class: ${ec.name}`);
    }

    // 2. Event Types
    const eventTypes = [
        { id: "FA_ADDITION_STD", name: "Standard Asset Addition", eventClassId: "FA_ADDITION" },
        { id: "FA_DEPR_RUN", name: "Depreciation Run", eventClassId: "FA_DEPRECIATION" },
        { id: "FA_RETIREMENT_SALE", name: "Retirement (Sale)", eventClassId: "FA_RETIREMENT" }
    ];

    for (const et of eventTypes) {
        await db.insert(slaEventTypes).values(et).onConflictDoNothing();
        console.log(`   - Type: ${et.name}`);
    }

    // 3. Journal Line Types (JLTs)
    // Force delete to ensure updates
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "FA_ADDITION"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "FA_DEPRECIATION"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "FA_RETIREMENT"));

    const jlts = [
        // FA_ADDITION
        {
            code: "ASSET_COST",
            eventClassId: "FA_ADDITION",
            name: "Asset Cost",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "Asset Cost: {assetNumber}",
            condition: "true"
        },
        {
            code: "ASSET_CLEARING",
            eventClassId: "FA_ADDITION",
            name: "Asset Clearing",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "LIABILITY", // Or Clearing Account
            amountSource: "amount",
            descriptionRule: "Clearing for Asset {assetNumber}",
            condition: "true"
        },

        // FA_DEPRECIATION
        {
            code: "DEPR_EXPENSE",
            eventClassId: "FA_DEPRECIATION",
            name: "Depreciation Expense",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "EXPENSE",
            amountSource: "amount",
            descriptionRule: "Depr Expense: {assetNumber}",
            condition: "true"
        },
        {
            code: "ACCUM_DEPR",
            eventClassId: "FA_DEPRECIATION",
            name: "Accumulated Depreciation",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "ASSET_CONTRA", // Special type or just ASSET? Engine treats ASSET as Credit if side=CREDIT.
            amountSource: "amount",
            descriptionRule: "Accum Depr: {assetNumber}",
            condition: "true"
        },

        // FA_RETIREMENT (Simplified: Gain Scenario)
        // Need verification if amountSource supports different values for different lines?
        // SlaEngine.deriveAmount uses `payload.amount` by default.
        // But for Retirements, we have Proceeds, Cost, Alloc Depr, Gain/Loss.
        // We'll need `sourceData` access in Amount Derivation or pass multiple amounts in payload?
        // Current SlaEngine: deriveAmount(source, payload) -> if source='amount', returns payload.amount.
        // If source starts with 'source.', it returns payload.sourceData[field].

        {
            code: "RET_PROCEEDS",
            eventClassId: "FA_RETIREMENT",
            name: "Proceeds of Sale",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET", // Cash/Receivable
            amountSource: "proceeds", // Dynamic Source
            descriptionRule: "Proceeds: {assetNumber}",
            condition: "true"
        },
        {
            code: "RET_COST_REMOVAL", // Optional
            eventClassId: "FA_RETIREMENT",
            name: "Cost of Removal",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "EXPENSE",
            amountSource: "costOfRemoval",
            descriptionRule: "Removal Cost: {assetNumber}",
            condition: "source.costOfRemoval > 0"
        },
        {
            code: "RET_NBV_CLEAR",
            eventClassId: "FA_RETIREMENT",
            name: "Net Book Value (Retired)",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "ASSET",
            amountSource: "netBookValue",
            descriptionRule: "NBV Retired: {assetNumber}",
            condition: "true"
        },
        {
            code: "RET_GAIN_LOSS",
            eventClassId: "FA_RETIREMENT",
            name: "Gain/Loss on Retirement",
            balanceType: "CREDIT", // Determine side dynamically? Engine V2 doesn't support dynamic side yet.
            // Workaround: Two JLTs? One for Gain (Cr), One for Loss (Dr).
            side: "CREDIT",
            accountingClass: "REVENUE", // or Expense
            amountSource: "gainLoss",
            descriptionRule: "Gain/Loss: {assetNumber}",
            condition: "source.gainLoss != 0" // Simplified for now. 
            // Real implementation needs split logic.
        }
    ];

    for (const jlt of jlts) {
        await db.insert(slaJournalLineTypes).values(jlt).onConflictDoNothing(); // Insert, conflicts handled by manual delete
        console.log(`   - JLT: ${jlt.name}`);
    }

    console.log("✅ Fixed Assets SLA Metadata Seeded.");
    process.exit(0);
}

seedFixedAssetsSla().catch(console.error);

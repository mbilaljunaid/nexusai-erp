
import { db } from "@db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes } from "@shared/schema/sla";
import { eq } from "drizzle-orm";

async function seedInventorySla() {
    console.log("🌱 Seeding Inventory SLA Metadata...");

    // 1. Event Classes
    const classes = [
        { id: "SHIP_CONFIRM", name: "Shipment Confirmation", applicationId: "INVENTORY" },
        { id: "PO_RECEIPT", name: "Purchase Order Receipt", applicationId: "INVENTORY" },
        { id: "INV_ADJUSTMENT", name: "Inventory Adjustment", applicationId: "INVENTORY" }
    ];

    for (const c of classes) {
        await db.insert(slaEventClasses).values(c).onConflictDoNothing();
        console.log(`   - Class: ${c.name}`);
    }

    // 2. Event Types
    const types = [
        { id: "SHIP_CONFIRM_STD", eventClassId: "SHIP_CONFIRM", name: "Standard Shipment" },
        { id: "PO_RECEIPT_STD", eventClassId: "PO_RECEIPT", name: "Standard PO Receipt" },
        { id: "INV_ADJUSTMENT_MISC", eventClassId: "INV_ADJUSTMENT", name: "Miscellaneous Adjustment" }
    ];

    for (const t of types) {
        await db.insert(slaEventTypes).values(t).onConflictDoNothing();
        console.log(`   - Type: ${t.name}`);
    }

    // 3. Journal Line Types (JLTs)

    // Force delete to ensure updates
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "SHIP_CONFIRM"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "PO_RECEIPT"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "INV_ADJUSTMENT"));

    const jlts = [
        // SHIP_CONFIRM
        {
            code: "COGS_RECOGNITION",
            eventClassId: "SHIP_CONFIRM",
            name: "Cost of Goods Sold",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "EXPENSE",
            amountSource: "amount", // Use payload amount (which we calculate as Qty * Cost)
            descriptionRule: "COGS for Item {itemId}",
            condition: "true"
        },
        {
            code: "INV_VALUATION_ISSUE",
            eventClassId: "SHIP_CONFIRM",
            name: "Inventory Valuation (Issue)",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "Inv Issue for Order {orderId}",
            condition: "true"
        },

        // PO_RECEIPT
        {
            code: "INV_VALUATION_RECEIPT",
            eventClassId: "PO_RECEIPT",
            name: "Inventory Valuation (Receipt)",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "Inv Receipt for PO {poId}",
            condition: "true"
        },
        {
            code: "ACCRUAL_RNI",
            eventClassId: "PO_RECEIPT",
            name: "Received Not Invoiced",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "LIABILITY",
            amountSource: "amount",
            descriptionRule: "Accrual for PO {poId}",
            condition: "true"
        },

        // INV_ADJUSTMENT
        {
            code: "INV_ADJ_VALUATION",
            eventClassId: "INV_ADJUSTMENT",
            name: "Inventory Valuation (Adjustment)",
            balanceType: "DEBIT", // Default side, engine handles sign based on amount? No, JLT has fixed side usually.
            // For Adjustment, amount can be positive or negative.
            // If negative, Debit becomes Credit.
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "Adjustment for Item {itemId}",
            condition: "true"
        },
        {
            code: "INV_ADJ_EXPENSE",
            eventClassId: "INV_ADJUSTMENT",
            name: "Inventory Adjustment Expense",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "EXPENSE",
            amountSource: "amount",
            descriptionRule: "Adjustment Expense for Item {itemId}",
            condition: "true"
        }
    ];

    for (const jlt of jlts) {
        // Check existing
        const existing = await db.select().from(slaJournalLineTypes)
            .where(eq(slaJournalLineTypes.code, jlt.code));

        if (existing.length === 0) {
            await db.insert(slaJournalLineTypes).values(jlt);
            console.log(`   - JLT: ${jlt.name}`);
        } else {
            console.log(`   - JLT: ${jlt.name} (Skipped - Exists)`);
        }
    }

    console.log("✅ Inventory SLA Metadata Seeded.");
    process.exit(0);
}

seedInventorySla().catch(console.error);


import { db } from "@db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes } from "@shared/schema/sla";
import { eq } from "drizzle-orm";

async function seedProjectsSla() {
    console.log("🌱 Seeding Projects & Construction SLA Metadata...");

    // 1. Event Classes
    const eventClasses = [
        { id: "PROJECT_COST", name: "Project Cost", applicationId: "PPM", module: "PPM" },
        { id: "PROJECT_REVENUE", name: "Project Revenue", applicationId: "PPM", module: "PPM" },
        { id: "PROJECT_CIP", name: "Construction In Progress", applicationId: "PPM", module: "PPM" },
        { id: "CONSTRUCTION_PAY_APP", name: "Construction Pay Application", applicationId: "CONST", module: "CONST" }
    ];

    for (const ec of eventClasses) {
        await db.insert(slaEventClasses).values(ec).onConflictDoNothing();
        console.log(`   - Class: ${ec.name}`);
    }

    // 2. Event Types
    const eventTypes = [
        { id: "PROJ_COST_LABOR", name: "Labor Cost", eventClassId: "PROJECT_COST" },
        { id: "PROJ_COST_USAGE", name: "Usage Cost", eventClassId: "PROJECT_COST" },
        { id: "PROJ_COST_BURDEN", name: "Burden Cost", eventClassId: "PROJECT_COST" },
        { id: "PROJ_REV_ACCRUAL", name: "Revenue Accrual", eventClassId: "PROJECT_REVENUE" },
        { id: "PROJ_CIP_ASSET", name: "Asset Line Generation", eventClassId: "PROJECT_CIP" },
        { id: "CONST_PROGRESS_BILLING", name: "Progress Billing", eventClassId: "CONSTRUCTION_PAY_APP" }
    ];

    for (const et of eventTypes) {
        await db.insert(slaEventTypes).values(et).onConflictDoNothing();
        console.log(`   - Type: ${et.name}`);
    }

    // 3. Journal Line Types (JLTs)
    // Cleanup old if exists
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "PROJECT_COST"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "PROJECT_REVENUE"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "PROJECT_CIP"));
    await db.delete(slaJournalLineTypes).where(eq(slaJournalLineTypes.eventClassId, "CONSTRUCTION_PAY_APP"));

    const jlts = [
        // PROJECT_COST (Expense/Raw)
        {
            code: "PROJ_RAW_COST",
            eventClassId: "PROJECT_COST",
            name: "Project Raw Cost",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "EXPENSE",
            amountSource: "amount",
            descriptionRule: "Project Cost: {projectNumber} - {taskNumber}",
            condition: "true"
        },
        {
            code: "PROJ_COST_CLEARING",
            eventClassId: "PROJECT_COST",
            name: "Cost Clearing",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "LIABILITY",
            amountSource: "amount",
            descriptionRule: "Clearing: {transactionSource}",
            condition: "true"
        },

        // PROJECT_REVENUE
        {
            code: "PROJ_UNBILLED_REC",
            eventClassId: "PROJECT_REVENUE",
            name: "Unbilled Receivables",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "Unbilled Rec: {projectNumber}",
            condition: "true"
        },
        // CONSTRUCTION_PAY_APP
        {
            code: "CONST_WIP",
            eventClassId: "CONSTRUCTION_PAY_APP",
            name: "WIP Value (SLA)",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "totalCompleted",
            descriptionRule: "WIP: {applicationNumber}",
            condition: "true"
        },
        {
            code: "CONST_AP_ACCRUAL",
            eventClassId: "CONSTRUCTION_PAY_APP",
            name: "AP Accrual (SLA)",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "LIABILITY",
            amountSource: "currentPaymentDue",
            descriptionRule: "AP Accrual: {applicationNumber}",
            condition: "true"
        },
        {
            code: "CONST_RETENTION",
            eventClassId: "CONSTRUCTION_PAY_APP",
            name: "Retainage Payable (SLA)",
            balanceType: "CREDIT",
            side: "CREDIT", // Usually Liability (Retained % withheld)
            accountingClass: "LIABILITY",
            amountSource: "retentionAmount",
            descriptionRule: "Retainage: {applicationNumber}",
            condition: "source.retentionAmount > 0"
        },
        {
            code: "PROJ_REVENUE",
            eventClassId: "PROJECT_REVENUE",
            name: "Project Revenue",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "REVENUE",
            amountSource: "amount",
            descriptionRule: "Revenue: {projectNumber}",
            condition: "true"
        },

        // PROJECT_CIP (Capitalization)
        {
            code: "PROJ_WIP_CIP",
            eventClassId: "PROJECT_CIP",
            name: "CIP / WIP Asset",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "ASSET",
            amountSource: "amount",
            descriptionRule: "CIP Addition: {projectNumber}",
            condition: "true"
        },
        {
            code: "PROJ_WIP_CLEARING",
            eventClassId: "PROJECT_CIP",
            name: "WIP Clearing",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "IsActive", // Should be EXPENSE/CLEARING
            amountSource: "amount",
            descriptionRule: "Transfer to CIP",
            condition: "true"
        }
    ];

    for (const jlt of jlts) {
        await db.insert(slaJournalLineTypes).values(jlt as any).onConflictDoNothing();
        console.log(`   - JLT: ${jlt.name}`);
    }

    console.log("✅ Projects SLA Metadata Seeded.");
    process.exit(0);
}

seedProjectsSla().catch(console.error);

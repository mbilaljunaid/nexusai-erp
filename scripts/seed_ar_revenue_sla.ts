
import { db } from "../server/db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes } from "../shared/schema/sla";
import { eq } from "drizzle-orm";

async function seedArRevenueSla() {
    console.log("🌱 Seeding AR Revenue SLA Metadata...");

    // 1. Event Classes
    await db.insert(slaEventClasses).values({
        id: "AR_REVENUE",
        name: "Revenue Recognition",
        applicationId: "AR",
        module: "AR"
    }).onConflictDoNothing();

    await db.insert(slaEventClasses).values({
        id: "AR_CM_APP",
        name: "Credit Memo Application",
        applicationId: "AR",
        module: "AR"
    }).onConflictDoNothing();

    // 2. Event Types
    await db.insert(slaEventTypes).values({
        id: "AR_REV_REC_STD",
        name: "Standard Revenue Recognition",
        eventClassId: "AR_REVENUE"
    }).onConflictDoNothing();

    await db.insert(slaEventTypes).values({
        id: "AR_CM_APPLY_STD",
        name: "Credit Memo Apply",
        eventClassId: "AR_CM_APP"
    }).onConflictDoNothing();

    // 3. JLTs
    const jlts = [
        // Revenue Recognition
        {
            code: "DEF_REV_DR",
            eventClassId: "AR_REVENUE",
            name: "Deferred Revenue Relief",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "DEFERRED_REVENUE",
            amountSource: "amount",
            descriptionRule: "Def Rev Relief: {description}",
            condition: "true"
        },
        {
            code: "REV_REC_CR",
            eventClassId: "AR_REVENUE",
            name: "Revenue Recognition",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "REVENUE",
            amountSource: "amount",
            descriptionRule: "Revenue Rec: {description}",
            condition: "true"
        },
        // CM Application (Wash)
        {
            code: "CM_APP_REC_DR",
            eventClassId: "AR_CM_APP",
            name: "Receivable (CM Side)",
            balanceType: "DEBIT",
            side: "DEBIT",
            accountingClass: "RECEIVABLE",
            amountSource: "amount",
            descriptionRule: "CM App Dr: {description}",
            condition: "true"
        },
        {
            code: "CM_APP_REC_CR",
            eventClassId: "AR_CM_APP",
            name: "Receivable (Inv Side)",
            balanceType: "CREDIT",
            side: "CREDIT",
            accountingClass: "RECEIVABLE",
            amountSource: "amount",
            descriptionRule: "CM App Cr: {description}",
            condition: "true"
        }
    ];

    for (const jlt of jlts) {
        await db.insert(slaJournalLineTypes).values(jlt as any).onConflictDoNothing();
        console.log(`   - JLT: ${jlt.code}`);
    }

    console.log("✅ AR Revenue SLA Seeded.");
    process.exit(0);
}

seedArRevenueSla().catch(console.error);

import { db } from "../server/db";
import { slaEventClasses } from "../shared/schema";

async function seedSlaMetadata() {
    console.log("Seeding SLA Event Classes...");

    const eventClasses = [
        {
            id: "AP_INVOICE_VALIDATED",
            applicationId: "AP",
            name: "AP Invoice Validated",
            description: "Accounting for validated AP invoices",
            entityTable: "ap_invoices"
        },
        {
            id: "AP_PAYMENT_CREATED",
            applicationId: "AP",
            name: "AP Payment Created",
            description: "Accounting for payment creation in AP",
            entityTable: "ap_payments"
        },
        {
            id: "AR_INVOICE_COMPLETE",
            applicationId: "AR",
            name: "AR Invoice Complete",
            description: "Accounting for completed AR invoices",
            entityTable: "ar_invoices"
        }
    ];

    for (const ec of eventClasses) {
        try {
            await db.insert(slaEventClasses).values(ec).onConflictDoNothing();
            console.log(`✅ Seeded event class: ${ec.id}`);
        } catch (err) {
            console.error(`❌ Failed to seed ${ec.id}:`, err);
        }
    }

    console.log("SLA Metadata seeding completed.");
}

seedSlaMetadata();

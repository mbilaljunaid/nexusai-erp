
import { db } from "../server/db";
import { slaEventTypes } from "../shared/schema/sla";

async function seedInvoicesApVoidSla() {
    console.log("🌱 Seeding AP Payment Void SLA Metadata...");

    // Event Type for Void
    await db.insert(slaEventTypes).values({
        id: "AP_PAYMENT_VOIDED",
        name: "Payment Voided",
        eventClassId: "AP_PAYMENT", // Uses existing class
        description: "Reversal of AP Payment"
    }).onConflictDoNothing();

    console.log("✅ AP Void SLA Seeded.");
    process.exit(0);
}

seedInvoicesApVoidSla().catch(console.error);

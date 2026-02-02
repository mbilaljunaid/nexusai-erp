
import { db } from "../server/db";
import { slaEventClasses, slaMappingSets, slaAccountingRules } from "../shared/schema/sla";
import { eq } from "drizzle-orm";

async function seedMaintenanceSla() {
    console.log("🛠️ Seeding Maintenance SLA Configuration...");

    // 1. Event Classes
    const eventClasses = [
        {
            id: "MAINT_MATERIAL_ISSUE",
            applicationId: "MAINT",
            name: "Maintenance Material Issue",
            description: "Issue of spare parts to a Work Order",
            enabledFlag: true
        },
        {
            id: "MAINT_RESOURCE_CHARGING",
            applicationId: "MAINT",
            name: "Maintenance Resource Charging",
            description: "Booking of labor hours to a Work Order",
            enabledFlag: true
        }
    ];

    for (const ec of eventClasses) {
        await db.insert(slaEventClasses)
            .values(ec)
            .onConflictDoUpdate({ target: slaEventClasses.id, set: ec });
        console.log(`✅ Event Class: ${ec.name}`);
    }

    console.log("✨ SLA Configuration Complete.");
    process.exit(0);
}

seedMaintenanceSla().catch(console.error);

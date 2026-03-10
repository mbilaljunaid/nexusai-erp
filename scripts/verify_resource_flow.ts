
import { db } from "../server/db";
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";
import { users } from "../shared/schema";
import { maintWorkOrderResources, maintWorkOrders, faAssets } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyResourceFlow() {
    console.log("🛠️ Verifying Resource Management (Labor) Flow...");

    try {
        // 1. Ensure a Technician User exists
        let tech = await db.query.users.findFirst({
            where: eq(users.email, "tech.john@example.com")
        });


        if (!tech) {
            console.log("👷 Creating Test Technician...");
            [tech] = await db.insert(users).values({
                name: "John Tech",
                role: "TECHNICIAN",
                email: "tech.john@example.com",
                password: "hashed_password"
            }).returning();

        }
        console.log(`✅ Using Technician: ${tech.name} (${tech.id})`);


        // 2. Create a Work Order
        console.log("📝 Creating Work Order...");
        const asset = await db.query.faAssets.findFirst();
        const wo = await maintenanceService.createWorkOrder({
            description: "Fix Wiring",
            type: "CORRECTIVE",
            priority: "HIGH",
            assetId: asset?.id || "unknown"
        });
        console.log(`✅ Work Order: ${wo.workOrderNumber}`);

        // 3. Assign Technician
        console.log("👷 Assigning Technician...");
        const [assignment] = await maintenanceService.assignTechnician(wo.id, {
            userId: tech.id,
            plannedHours: 4
        });
        console.log(`✅ Technician Assigned: Planned 4 hrs`);

        // 4. Log Labor Hours
        console.log("⏱️ Logging Hours...");
        await maintenanceService.logLaborHours(assignment.id, 2.5);
        console.log("✅ Logged 2.5 hours");

        // 5. Verify Actuals
        const updatedAssign = await db.query.maintWorkOrderResources.findFirst({
            where: eq(maintWorkOrderResources.id, assignment.id)
        });

        if (Number(updatedAssign?.actualHours) !== 2.5) {
            throw new Error(`Actual hours not updated. Expected 2.5, Got ${updatedAssign?.actualHours}`);
        }
        console.log("✅ Resource Actuals Updated");

        console.log("✨ Resource Management Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyResourceFlow();

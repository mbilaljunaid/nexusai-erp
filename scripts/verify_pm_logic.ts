
import { maintenanceService } from "../server/services/MaintenanceService";
import { db } from "../server/db";
import { maintPMDefinitions, maintWorkDefinitions, faAssets } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyPMLogic() {
    console.log("🛠️ Verifying Preventive Maintenance Logic...");

    try {
        // 1. Get Dependencies (Asset, Work Def)
        const asset = await db.query.faAssets.findFirst();
        if (!asset) throw new Error("No User Asset found. Run foundation verify.");

        // Need a Work Def
        let workDef = await db.query.maintWorkDefinitions.findFirst();
        if (!workDef) {
            const wd = await db.insert(maintWorkDefinitions).values({
                name: "Standard Inspect",
                description: "Std Inspection",
                type: "STANDARD",
                status: "ACTIVE"
            }).returning();
            workDef = wd[0];
            console.log("✅ Created Stub Work Definition");
        }

        // 2. Create PM Definition (Backdated Start Date so it is due immediately)
        const backdatedStart = new Date();
        backdatedStart.setMonth(backdatedStart.getMonth() - 2); // 2 months ago

        const [pm] = await maintenanceService.createPMDefinition({
            name: "Monthly Test PM",
            assetId: asset.id,
            workDefinitionId: workDef.id,
            triggerType: "TIME",
            frequency: 1,
            frequencyUom: "MONTH",
            effectiveStartDate: backdatedStart,
            active: true
        });
        console.log(`✅ Created PM Definition: ${pm.name} (Start: ${backdatedStart.toISOString()})`);

        // 3. Generate Work Orders
        // Expectation: Since it started 2 months ago and freq is 1 month, it should be due.
        console.log("Running Scheduler...");
        const wos = await maintenanceService.generatePMWorkOrders();

        if (wos.length > 0) {
            console.log(`✅ Generated ${wos.length} Work Orders`);
            console.log(`✅ First WO: ${wos[0].workOrderNumber} (Scheduled: ${wos[0].scheduledStartDate})`);
        } else {
            console.error("❌ Failed to generate Work Orders (Should have been due)");
            process.exit(1);
        }

        // 4. Run Again (Idempotency Check)
        // Since we just ran it, lastGeneratedDate should be NOW. Next due is +1 month. Should NOT generate.
        const wos2 = await maintenanceService.generatePMWorkOrders();
        if (wos2.length === 0) {
            console.log("✅ Idempotency Verified (No duplicate WOs created immediately)");
        } else {
            console.error(`❌ Idempotency Failed: Generated ${wos2.length} extra WOs`);
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyPMLogic()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

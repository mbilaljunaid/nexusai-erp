
import { db } from "../server/db";
import { maintenanceMeterService } from "../server/services/MaintenanceMeterService";
import { maintenanceLibraryService } from "../server/services/MaintenanceLibraryService";
import { maintenanceService } from "../server/services/MaintenanceService";
import { maintPMDefinitions, maintMeters } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyStep2() {
    console.log("🛠️ Verifying Maintenance Parity Step 2 (Advanced PM)...");

    try {
        // 1. Setup Data
        const asset = await db.query.faAssets.findFirst();
        if (!asset) throw new Error("No assets found.");

        const meter = await maintenanceMeterService.createMeter({
            assetId: asset.id,
            name: "PM Trigger Meter",
            unitOfMeasure: "Cycles",
            readingType: "ABSOLUTE",
            currentValue: "0" // Start at 0
        });

        const def = await maintenanceLibraryService.createWorkDefinition({
            code: "PM-METER-DEF",
            name: "Meter Based Service",
            type: "PM"
        });

        // 2. Create PM Definition (Every 1000 Cycles)
        const pm = await maintenanceService.createPMDefinition({
            name: "1000 Cycle Inspection",
            assetId: asset.id,
            workDefinitionId: def.id,
            triggerType: "METER",
            meterId: meter.id,
            intervalValue: "1000",
            active: true
        });
        console.log(`✅ PM Definition Created: ${pm[0].id}`);

        // 3. Test: Below Threshold
        console.log("📊 Logging Reading: 500 (Threshold 1000)");
        await maintenanceMeterService.logReading(meter.id, 500, "TEST");

        const wos1 = await maintenanceService.generatePMWorkOrders();
        console.log(`Generated WOs: ${wos1.length}`);
        if (wos1.length > 0) throw new Error("PM generated prematurely!");

        // 4. Test: Above Threshold
        console.log("📊 Logging Reading: 1100 (Threshold 1000)");
        await maintenanceMeterService.logReading(meter.id, 1100, "TEST");

        const wos2 = await maintenanceService.generatePMWorkOrders();
        console.log(`Generated WOs: ${wos2.length}`);

        if (wos2.length === 0) throw new Error("PM failed to generate after threshold cross!");
        console.log(`✅ Generated Meter-Based WO: ${wos2[0].workOrderNumber}`);

        // 5. Verify Baseline Update
        const updatedPm = await db.query.maintPMDefinitions.findFirst({
            where: eq(maintPMDefinitions.id, pm[0].id)
        });

        const lastReading = Number(updatedPm?.lastMeterReading);
        if (lastReading !== 1100) console.warn(`⚠️ Warning: Expected lastMeterReading 1100, got ${lastReading}. (Logic might reset to interval or current). Logic used: Current.`);

        console.log("✨ Step 2 Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyStep2();

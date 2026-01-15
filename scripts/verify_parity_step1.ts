
import { db } from "../server/db";
import { maintMeters, maintMeterReadings, maintWorkDefinitions, maintWorkDefinitionOperations, faAssets } from "@shared/schema";
import { maintenanceMeterService } from "../server/services/MaintenanceMeterService";
import { maintenanceLibraryService } from "../server/services/MaintenanceLibraryService";
import { maintenanceService } from "../server/services/MaintenanceService";

async function verifyStep1() {
    console.log("🛠️ Verifying Maintenance Parity Step 1 (Meters & Library)...");

    try {
        // 1. Setup: Get Asset
        const asset = await db.query.faAssets.findFirst();
        if (!asset) throw new Error("No assets found. Run bootstrap_assets.");

        // --- METERS TEST ---
        console.log("📊 Testing Meters...");

        // Create Meter
        const meter = await maintenanceMeterService.createMeter({
            assetId: asset.id,
            name: "Odometer Verified",
            unitOfMeasure: "KM",
            readingType: "ABSOLUTE",
            currentValue: "10000"
        });
        console.log(`✅ Meter Created: ${meter.id}`);

        // Log Reading
        const reading = await maintenanceMeterService.logReading(meter.id, 10500, "TEST");
        console.log(`✅ Reading Logged: ${reading.readingValue} (Delta: ${reading.deltaValue})`);

        // Verify Update
        const updatedMeter = await db.query.maintMeters.findFirst({ where: (m, { eq }) => eq(m.id, meter.id) });


        if (Number(updatedMeter?.currentValue) !== 10500) throw new Error(`Meter current value did not update! Got ${updatedMeter?.currentValue}`);


        // --- LIBRARY TEST ---
        console.log("📚 Testing Work Library...");

        // Create Template
        const def = await maintenanceLibraryService.createWorkDefinition({
            code: "PM-TEST-" + Date.now(),
            name: "Standard 500H Service",
            type: "PM"
        });
        console.log(`✅ Definition Created: ${def.id}`);

        // Add Ops
        await maintenanceLibraryService.addOperationToDefinition({
            workDefinitionId: def.id,
            sequenceNumber: 10,
            name: "Change Oil",
            description: "Drain and refill"
        });
        await maintenanceLibraryService.addOperationToDefinition({
            workDefinitionId: def.id,
            sequenceNumber: 20,
            name: "Replace Filter",
            description: "Oil Filter"
        });

        // Apply to WO
        const wo = await maintenanceService.createWorkOrder({
            description: "Template Test Order",
            assetId: asset.id,
            status: "DRAFT",
            priority: "NORMAL"
        });

        const result = await maintenanceLibraryService.applyWorkDefinition(wo.id, def.id);
        console.log(`✅ Applied Template: ${result.message}`);

        // Verify Ops Copied
        // Verify Ops Copied
        const woWithDetails = await maintenanceService.getWorkOrder(wo.id);
        const woOps = woWithDetails?.operations || [];
        if (woOps.length !== 2) throw new Error(`Expected 2 ops, found ${woOps.length}`);


        console.log("✨ Step 1 Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyStep1();

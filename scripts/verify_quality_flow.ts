
import { db } from "../server/db";
import { maintInspectionDefinitions, faAssets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { maintenanceService } from "../server/services/MaintenanceService";
import { maintenanceQualityService } from "../server/services/MaintenanceQualityService";

async function verifyQualityFlow() {
    console.log("🛠️ Verifying Maintenance Quality & Safety Flow...");

    try {
        // 1. Get Template
        const tmpl = await db.query.maintInspectionDefinitions.findFirst({
            where: eq(maintInspectionDefinitions.name, "General Equipment Safety Check")
        });
        if (!tmpl) throw new Error("Safety Check Template not found (Run bootstrap)");

        // 2. Create Work Order
        const asset = await db.query.faAssets.findFirst();
        console.log("📝 Creating Work Order...");
        const wo = await maintenanceService.createWorkOrder({
            description: "Safety Verification Order",
            assetId: asset!.id,
            status: "IN_PROGRESS"
        });

        // 3. Create Inspection
        console.log("📋 Creating Inspection...");
        const [insp] = await maintenanceQualityService.createInspection({
            templateId: tmpl.id,
            workOrderId: wo.id,
            assetId: asset!.id
        });
        console.log(`✅ Inspection Created: ${insp.id}`);

        // 4. Submit Inspection
        console.log("✅ Submitting Results...");
        const [updatedInsp] = await maintenanceQualityService.submitInspectionResults(insp.id, [
            { questionId: "q1", answer: "YES" },
            { questionId: "q2", answer: "YES" },
            { questionId: "q3", answer: 1250.5 }
        ], "PASS");

        if (updatedInsp.status !== "PASS") throw new Error("Inspection Status Mismatch");

        // 5. Create Permit
        console.log("🦺 Generating Permit...");
        const [permit] = await maintenanceQualityService.createPermit({
            workOrderId: wo.id,
            type: "HOT_WORK",
            validFrom: new Date(),
            validTo: new Date(Date.now() + 86400000),
            hazards: "Sparks, Fire",
            precautions: "Fire Extinguisher nearby"
        });
        console.log(`✅ Permit Genreated: ${permit.permitNumber}`);

        // 6. Verify Links
        const woInspections = await maintenanceQualityService.getInspectionsForWorkOrder(wo.id);
        const woPermits = await maintenanceQualityService.getPermitsForWorkOrder(wo.id);

        if (woInspections.length !== 1) throw new Error("Inspection not linked to WO");
        if (woPermits.length !== 1) throw new Error("Permit not linked to WO");

        console.log("✨ Quality Verification Passed!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyQualityFlow();

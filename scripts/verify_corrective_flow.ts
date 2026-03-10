
import { db } from "../server/db";
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";
import { faAssets } from "../shared/schema/fixedAssets";
import { maintServiceRequests, maintWorkOrders } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyCorrectiveFlow() {
    console.log("🛠️ Verifying Service Request (Breakdown) Flow...");

    try {
        // 1. Ensure an Asset exists
        let asset = await db.query.faAssets.findFirst();
        if (!asset) {
            console.log("⚠️ No asset found, creating stub...");
            [asset] = await db.insert(faAssets).values({
                assetNumber: "AST-BROKEN-001",
                description: "Broken Machine Stub",
                status: "OPERATING"
            }).returning();
        }
        console.log(`✅ Using Asset: ${asset.assetNumber} (${asset.id})`);

        // 2. Submit a Service Request
        console.log("📝 Submitting Service Request...");
        const [sr] = await maintenanceService.createServiceRequest({
            description: "Machine is making a loud grinding noise.",
            assetId: asset.id,
            priority: "HIGH",
            requestedBy: null
        });

        if (!sr || !sr.id) throw new Error("Failed to create Service Request");
        console.log(`✅ Service Request Created: ${sr.requestNumber} (Status: ${sr.status})`);

        // 3. List Requests
        const list = await maintenanceService.listServiceRequests();
        if (list.length === 0) throw new Error("List is empty");
        console.log(`✅ List contains ${list.length} requests`);

        // 4. Convert to Work Order
        console.log("🔄 Converting to Work Order...");
        const wo = await maintenanceService.convertSRtoWO(sr.id, {
            priority: "CRITICAL",
            workDefinitionId: null // Ad-hoc corrective
        });

        if (!wo || !wo.id) throw new Error("Failed to create Work Order from SR");
        console.log(`✅ Work Order Created: ${wo.workOrderNumber} (Type: ${wo.type})`);

        // 5. Verify Linkage
        const updatedSR = await db.query.maintServiceRequests.findFirst({
            where: eq(maintServiceRequests.id, sr.id)
        });

        if (updatedSR?.status !== "CONVERTED") throw new Error(`SR Status not updated. Got: ${updatedSR?.status}`);
        if (updatedSR?.workOrderId !== wo.id) throw new Error("SR not linked to WO");

        console.log("✅ SR Updated to CONVERTED and Linked to WO");
        console.log("✨ Corrective Flow Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyCorrectiveFlow();

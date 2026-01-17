
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";
import { wmsHandlingUnitTypes, wmsWaveTemplates } from "./shared/schema/scm";
import { wmsUnitTypeService } from "./server/modules/inventory/wms-unit-type.service";
import { wmsWaveService } from "./server/modules/inventory/wms-wave.service";

async function verifyPhase32() {
    console.log("🧠 Verifying Phase 32: Final Polish...");

    try {
        const warehouseId = "PHASE32-ORG";

        // 1. Handling Unit Types
        console.log("   --- Handling Unit Types ---");
        const ut = await wmsUnitTypeService.create({
            warehouseId,
            code: "PALLET-TEST",
            description: "Test Pallet",
            maxWeight: 1000
        });
        console.log("   ✅ Created Unit Type: " + ut.code);

        const listUt = await wmsUnitTypeService.list(warehouseId);
        if (listUt.length > 0) {
            console.log("   ✅ Listed Unit Types OK");
        } else {
            throw new Error("Unit Type List failed");
        }

        // 2. Wave Templates
        console.log("   --- Wave Templates ---");
        const tmpl = await wmsWaveService.createTemplate({
            warehouseId,
            name: "Overnight Orders",
            criteria: { limit: 100, carrier: "UPS" }
        });
        console.log("   ✅ Created Wave Template: " + tmpl[0].name);

        const listTmpl = await wmsWaveService.listTemplates(warehouseId);
        if (listTmpl.length > 0) {
            console.log("   ✅ Listed Templates OK");
        } else {
            throw new Error("Template List failed");
        }

        console.log("🎉 Phase 32 Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyPhase32();

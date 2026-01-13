import { db } from "../server/db";
import { ppmService } from "../server/services/PpmService";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    ppmExpenditureTypes, ppmProjectAssets, ppmAssetLines
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyPpmCapitalization() {
    console.log("🚀 Starting PPM Capitalization Engine Verification...");

    try {
        // 1. Setup Capital Project & Task
        console.log("\n🧪 Step 1: Setting up Capital Project and Task...");
        const project = await ppmService.createProject({
            projectNumber: `CAP-PRJ-${Date.now()}`,
            name: "Headquarters Construction",
            projectType: "CAPITAL",
            startDate: new Date(),
            status: "ACTIVE"
        });

        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "CONST-01",
            name: "Structural Foundation",
            startDate: new Date(),
            chargeableFlag: true,
            capitalizableFlag: true // Crucial for Phase 5
        });
        console.log(`   ✅ Project: ${project.projectNumber}, Task: ${task.taskNumber} (Capitalizable)`);

        // 2. Setup Expenditure Type
        const [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Professional Services")).limit(1);

        // 3. Import Raw Costs
        console.log("\n🧪 Step 2: Importing Expenditure Items (CIP)...");
        const [item1] = await ppmService.importExpenditureItems([{
            taskId: task.id,
            expenditureTypeId: expType.id,
            expenditureItemDate: new Date(),
            quantity: "1.00",
            rawCost: "50000.0000",
            transactionSource: "MANUAL",
            status: "UNCOSTED"
        }]);

        // Run costing (updates to CIP status)
        await ppmService.applyBurdening(item1.id);

        const [verifiedItem] = await db.select().from(ppmExpenditureItems).where(eq(ppmExpenditureItems.id, item1.id));
        console.log(`   ✅ Item Status: ${verifiedItem.status}, Cap Status: ${verifiedItem.capitalizationStatus}`);

        if (verifiedItem.capitalizationStatus !== "CIP") {
            throw new Error(`Expected capitalization status CIP, got ${verifiedItem.capitalizationStatus}`);
        }

        // 4. Create Project Asset
        console.log("\n🧪 Step 3: Creating Project Asset...");
        const projectAsset = await ppmService.createProjectAsset({
            projectId: project.id,
            assetName: "Corporate Tower - Main Frame",
            assetDescription: "Main structural frame for HQ",
            status: "DRAFT"
        });
        console.log(`   ✅ Project Asset: ${projectAsset.assetName}`);

        // 5. Generate Asset Lines
        console.log("\n🧪 Step 4: Generating Asset Lines...");
        const assetLines = await ppmService.generateAssetLines(projectAsset.id);
        console.log(`   ✅ Generated ${assetLines.length} asset lines for accumulation`);

        if (assetLines.length !== 1) {
            throw new Error(`Expected 1 asset line, got ${assetLines.length}`);
        }

        // 6. Interface to Fixed Assets
        console.log("\n🧪 Step 5: Interfacing to Fixed Assets...");
        const faResult = await ppmService.interfaceToFA(projectAsset.id);
        console.log(`   ✅ Capitalized Amount: ${faResult.capitalizedAmount}`);
        console.log(`   ✅ FA Asset ID: ${faResult.faAssetId}, Asset Number: ${faResult.assetNumber}`);

        // 7. Verify Final Status
        console.log("\n🧪 Step 6: Verifying final status...");
        const [finalItem] = await db.select().from(ppmExpenditureItems).where(eq(ppmExpenditureItems.id, item1.id));
        const [finalAsset] = await db.select().from(ppmProjectAssets).where(eq(ppmProjectAssets.id, projectAsset.id));

        console.log(`   ✅ Expenditure Item Cap Status: ${finalItem.capitalizationStatus}`);
        console.log(`   ✅ Project Asset Status: ${finalAsset.status}`);

        if (finalItem.capitalizationStatus !== "CAPITALIZED" || finalAsset.status !== "INTERFACED") {
            throw new Error("Final status verification failed");
        }

        console.log("\n✨ PPM Capitalization Engine Verified Successfully!");
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyPpmCapitalization();


import { db } from "../server/db";
import { PpmService } from "../server/services/PpmService";
import { ppmProjects, ppmTasks, ppmExpenditureItems, ppmProjectAssets, ppmAssetLines } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyPpmAssets() {
    console.log("🚀 Starting PPM Asset Capitalization Verification...");
    const service = new PpmService();

    try {
        // 1. Setup Data: Project & Task
        console.log("1. Creating Capital Project...");
        const project = await service.createProject({
            projectNumber: `CAP-${Date.now()}`,
            name: "Capital Expansion Project",
            projectType: "CAPITAL",
            startDate: new Date(),
            status: "ACTIVE"
        });
        console.log(`   > Project Created: ${project.projectNumber} (${project.id})`);

        console.log("2. Creating Capitalizable Task...");
        const task = await service.createTask({
            projectId: project.id,
            taskNumber: "1.1",
            name: "Construction Phase",
            startDate: new Date(),
            capitalizableFlag: true // CRITICAL for Asset Lines
        });
        console.log(`   > Task Created: ${task.taskNumber} (Capitalizable: ${task.capitalizableFlag})`);

        // 2b. Setup Data: Expenditure Type (Professional Services)
        // Assumes service handles this or we rely on existing. Service.collectFromAP creates it.
        // Let's manually ensure a type exists or just use a mock ID if we were mocking, but here we use real service flow.
        // We'll mimic 'collectFromAP' behavior by manually inserting an item or using a helper if exists.
        // PpmService doesn't have 'createExpenditureItem' public method easily exposed for manual test without AP line.
        // Actually, let's use `importExpenditureItems` if it exists (it does).

        const [expType] = await service.getExpenditureTypes();
        let typeId = expType?.id;
        if (!typeId) {
            const newType = await service.createExpenditureType("Construction Material", "Each", "Raw Materials");
            typeId = newType.id;
        }

        // 3. Create Costed Expenditure Item
        console.log("3. Creating Costed Expenditure Item...");
        const [item] = await service.importExpenditureItems([{
            taskId: task.id,
            expenditureTypeId: typeId,
            expenditureItemDate: new Date(),
            quantity: "100",
            unitCost: "50",
            rawCost: "5000",
            transactionSource: "MANUAL",
            transactionReference: `REF-${Date.now()}`,
            denomCurrencyCode: "USD",
            status: "COSTED", // Assume already costed
            capitalizationStatus: "CIP" // Set to CIP because task is capitalizable
        }]);
        console.log(`   > Exp Item Created: $${item.rawCost} (Status: ${item.status}, Cap: ${item.capitalizationStatus})`);

        // 4. Create Project Asset
        console.log("4. Creating Project Asset...");
        const asset = await service.createProjectAsset({
            projectId: project.id,
            assetName: "New Warehouse Building",
            assetType: "BUILDING",
            datePlacedInService: new Date(),
            description: "Main Warehouse",
            status: "NEW"
        });
        console.log(`   > Asset Created: ${asset.assetName} (${asset.id})`);

        // 5. Generate Asset Lines
        console.log("5. Generating Asset Lines...");
        const lines = await service.generateAssetLines(asset.id);
        console.log(`   > Generated ${lines.length} lines.`);

        if (lines.length === 0) throw new Error("Failed to generate asset lines!");
        if (Number(lines[0].capitalizedAmount) !== 5000) throw new Error(`Asset Amount Mismatch: Expected 5000, got ${lines[0].capitalizedAmount}`);

        // 6. Capitalize (Interface to FA)
        console.log("6. Capitalizing Asset (Interface to FA)...");
        const result = await service.interfaceToFA(asset.id);
        console.log(`   > Interface Success! FA Asset ID: ${result.faAssetId}`);

        // Verify Status
        const [updatedAsset] = await db.select().from(ppmProjectAssets).where(eq(ppmProjectAssets.id, asset.id));
        if (updatedAsset.status !== "INTERFACED") throw new Error("Asset Status not updated to INTERFACED");

        console.log("✅ Verification Successful!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyPpmAssets();

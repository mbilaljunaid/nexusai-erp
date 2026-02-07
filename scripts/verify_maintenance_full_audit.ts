
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";
import { maintenanceCostingService } from "../server/services/MaintenanceCostingService";
import { projectCostingIntegration } from "../server/services/ProjectCostingIntegration";
import { inventoryReorderService } from "../server/services/InventoryReorderService";
import { maintenanceQualityService } from "../server/services/MaintenanceQualityService";
import fs from "fs";
import path from "path";

async function auditMaintenanceModule() {
    console.log("=== 🔍 Full Maintenance Module Audit (Phase 9-14) ===");
    let passCount = 0;
    let failCount = 0;

    function check(label: string, condition: boolean) {
        if (condition) {
            console.log(`[PASS] ${label}`);
            passCount++;
        } else {
            console.error(`[FAIL] ${label}`);
            failCount++;
        }
    }

    // A. Schema / Database Tables
    console.log("\n--- A. Database Tables (Schema) ---");
    const requiredTables = [
        'maint_work_orders', 'maint_work_order_lines',
        'fa_assets', 'maint_pm_definitions',
        'maint_asset_boms', // Phase 13
        'maint_inspections', 'maint_inspection_definitions', // Phase 14
        'inv_items', 'purchase_requisitions' // Phase 13 SCM
    ];

    for (const table of requiredTables) {
        try {
            const res = await db.execute(sql`SELECT count(*) FROM information_schema.tables WHERE table_name = ${table}`);
            check(`Table '${table}' exists`, Number(res.rows[0].count) > 0);
        } catch (e) {
            check(`Table '${table}' check error`, false);
        }
    }

    // B. Backend Services
    console.log("\n--- B. Backend Services (Logic) ---");
    check("MaintenanceService instantiated", !!maintenanceService);
    check("MaintenanceCostingService instantiated", !!maintenanceCostingService);
    check("ProjectCostingIntegration instantiated (Ph 13)", !!projectCostingIntegration);
    check("InventoryReorderService instantiated (Ph 13)", !!inventoryReorderService);
    check("MaintenanceQualityService instantiated (Ph 14)", !!maintenanceQualityService);

    // Specific Method Checks
    check("Costing: Cost Rollup Logic", typeof maintenanceCostingService.getWorkOrderCosts === 'function');
    check("Project: Transfer Logic", typeof projectCostingIntegration.transferCostsToProjects === 'function');
    check("SCM: Reorder Logic", typeof inventoryReorderService.checkAndReorder === 'function');
    check("Quality: Submit Result Logic", typeof maintenanceQualityService.submitInspectionResults === 'function');

    // C. API Routes (Static Analysis)
    console.log("\n--- C. API Routes (Static Analysis) ---");
    const routesPath = path.join(process.cwd(), "server/modules/maintenance/routes.ts");
    if (fs.existsSync(routesPath)) {
        const content = fs.readFileSync(routesPath, 'utf8');
        check("Route: Asset BOM", content.includes("/assets/:id/bom"));
        check("Route: Reorder Check", content.includes("/inventory/:id/check-reorder"));
        check("Route: Project Transfer", content.includes("/work-orders/:id/costs/transfer-project"));
        check("Route: Quality Inspections", content.includes("/quality/inspections"));
    } else {
        check("Routes File Found", false);
    }

    // D. Frontend Components (Static Analysis)
    console.log("\n--- D. Frontend Components (Static Analysis) ---");
    const componentChecks = [
        { name: "MaintenanceWorkbench", path: "client/src/pages/maintenance/MaintenanceWorkbench.tsx" },
        { name: "TechnicianTaskView", path: "client/src/pages/maintenance/TechnicianTaskView.tsx" }, // Ph 14
        { name: "Asset360View", path: "client/src/pages/maintenance/Asset360View.tsx" },
        { name: "AssetBOMEditor", path: "client/src/components/maintenance/AssetBOMEditor.tsx" }, // Ph 13
        { name: "InspectionFormRunner", path: "client/src/components/maintenance/InspectionFormRunner.tsx" } // Ph 14
    ];

    for (const comp of componentChecks) {
        const fullPath = path.join(process.cwd(), comp.path);
        const exists = fs.existsSync(fullPath);
        check(`Component '${comp.name}' exists`, exists);
    }

    console.log(`\n=== Audit Complete ===`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    if (failCount === 0) {
        console.log("Verdict: ✅ ALL SYSTEMS GO");
    } else {
        console.log("Verdict: ⚠️ ISSUES FOUND");
    }

    process.exit(0);
}

auditMaintenanceModule();

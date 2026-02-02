
import fs from 'fs';
import path from 'path';

const projectRoot = "/Users/mbjunaid/Library/CloudStorage/GoogleDrive-mbilaljunaid@gmail.com/My Drive/Online Projects/13. NexusAIFirst/nexusai-erp";

const filesToCheck = [
    "client/src/pages/maintenance/AssetHierarchyTree.tsx",
    "client/src/pages/maintenance/FailureCodeConfig.tsx",
    "scripts/patch_asset_hierarchy.ts"
];

const appPath = path.join(projectRoot, "client/src/App.tsx");
const schemaPath = path.join(projectRoot, "shared/schema/fixedAssets.ts");

console.log("=== Phase 11 Verification ===");

// 1. Check Files Exist
filesToCheck.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`[PASS] Created/Modified ${file}`);
    } else {
        console.error(`[FAIL] Missing ${file}`);
    }
});

// 2. Check App.tsx wiring
const appContent = fs.readFileSync(appPath, 'utf-8');
if (appContent.includes('path="/maintenance/assets/hierarchy"') &&
    appContent.includes('path="/maintenance/config/failure-codes"')) {
    console.log("[PASS] Hierarchy and Failure Code routes registered");
} else {
    console.error("[FAIL] Routes missing in App.tsx");
}

// 3. Check Schema Update
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
if (schemaContent.includes('parentId: varchar("parent_id")')) {
    console.log("[PASS] faAssets schema updated with parentId");
} else {
    console.error("[FAIL] faAssets schema missing parentId");
}

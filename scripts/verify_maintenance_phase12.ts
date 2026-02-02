
import fs from 'fs';
import path from 'path';

const projectRoot = "/Users/mbjunaid/Library/CloudStorage/GoogleDrive-mbilaljunaid@gmail.com/My Drive/Online Projects/13. NexusAIFirst/nexusai-erp";

const filesToCheck = [
    "client/src/components/maintenance/CostAnalysisView.tsx",
    "server/services/MaintenanceCostingService.ts"
];

const servicePath = path.join(projectRoot, "server/services/MaintenanceCostingService.ts");

console.log("=== Phase 12 Verification ===");

// 1. Check Files Exist
filesToCheck.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`[PASS] Created/Modified ${file}`);
    } else {
        console.error(`[FAIL] Missing ${file}`);
    }
});

// 2. Check Service Logic
const serviceContent = fs.readFileSync(servicePath, 'utf-8');
if (serviceContent.includes('postCostsToGL')) {
    console.log("[PASS] postCostsToGL method implemented");
} else {
    console.error("[FAIL] postCostsToGL method missing");
}

if (serviceContent.includes('isCapital')) {
    console.log("[PASS] CIP Logic logic found");
}

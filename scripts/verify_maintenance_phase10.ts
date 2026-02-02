
import fs from 'fs';
import path from 'path';

const projectRoot = "/Users/mbjunaid/Library/CloudStorage/GoogleDrive-mbilaljunaid@gmail.com/My Drive/Online Projects/13. NexusAIFirst/nexusai-erp";

const filesToCheck = [
    "client/src/components/maintenance/PartRequirementList.tsx",
    "client/src/pages/maintenance/PMDefinitionBuilder.tsx",
    "client/src/pages/maintenance/TechnicianTaskView.tsx"
];

const appPath = path.join(projectRoot, "client/src/App.tsx");
const techViewPath = path.join(projectRoot, "client/src/pages/maintenance/TechnicianTaskView.tsx");

console.log("=== Phase 10 Verification ===");

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
if (appContent.includes('path="/maintenance/pm/builder"')) {
    console.log("[PASS] PM Builder route registered");
} else {
    console.error("[FAIL] PM Builder route missing");
}

// 3. Check Technician View Integration
const techContent = fs.readFileSync(techViewPath, 'utf-8');
if (techContent.includes('<PartRequirementList')) {
    console.log("[PASS] PartRequirementList embedded in TechnicianTaskView");
} else {
    console.error("[FAIL] PartRequirementList NOT found in TechnicianTaskView");
}

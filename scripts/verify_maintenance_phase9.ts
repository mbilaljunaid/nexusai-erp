
import fs from 'fs';
import path from 'path';

const projectRoot = "/Users/mbjunaid/Library/CloudStorage/GoogleDrive-mbilaljunaid@gmail.com/My Drive/Online Projects/13. NexusAIFirst/nexusai-erp";

const filesToCheck = [
    "client/src/pages/maintenance/MaintenanceWorkbench.tsx",
    "client/src/pages/maintenance/TechnicianTaskView.tsx",
    "client/src/pages/maintenance/Asset360View.tsx"
];

const appPath = path.join(projectRoot, "client/src/App.tsx");
const navPath = path.join(projectRoot, "client/src/config/navigation.ts");

console.log("=== Phase 9 Verification ===");

// 1. Check Files Exist
filesToCheck.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
        console.log(`[PASS] Created ${file}`);
    } else {
        console.error(`[FAIL] Missing ${file}`);
    }
});

// 2. Check App.tsx wiring
const appContent = fs.readFileSync(appPath, 'utf-8');
if (appContent.includes('<MaintenanceWorkbench initialTab="overview" />') &&
    appContent.includes('path="/maintenance/technician"') &&
    appContent.includes('path="/maintenance/asset-360"')) {
    console.log("[PASS] App.tsx routes wired correctly");
} else {
    console.error("[FAIL] App.tsx routes missing or incorrect");
}

// 3. Check MaintenanceWorkbench props
const workbenchPath = path.join(projectRoot, "client/src/pages/maintenance/MaintenanceWorkbench.tsx");
const workbenchContent = fs.readFileSync(workbenchPath, 'utf-8');
if (workbenchContent.includes('initialTab = "overview"')) {
    console.log("[PASS] MaintenanceWorkbench accepts initialTab prop");
} else {
    console.error("[FAIL] MaintenanceWorkbench missing initialTab prop support");
}

// 4. Check Navigation
const navContent = fs.readFileSync(navPath, 'utf-8');
if (navContent.includes('path: "/maintenance/technician"') && navContent.includes('path: "/maintenance/asset-360"')) {
    console.log("[PASS] Navigation menu updated");
} else {
    console.error("[FAIL] Navigation menu missing new items");
}

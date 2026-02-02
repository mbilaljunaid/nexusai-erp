import fs from "fs";
import path from "path";

async function verifyNavigationReachability() {
    console.log("🚀 Starting Manufacturing Navigation Reachability Audit...");

    const sidebarPath = path.join(process.cwd(), "client/src/components/app-sidebar.tsx");
    const appPath = path.join(process.cwd(), "client/src/App.tsx");

    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    const appContent = fs.readFileSync(appPath, "utf-8");

    // Extract Manufacturing URLs from sidebar
    const mfgSectionMatch = sidebarContent.match(/label: "Manufacturing",\s+items: \[([\s\S]*?)\]/);
    if (!mfgSectionMatch) {
        console.error("❌ Could not find Manufacturing section in sidebar");
        process.exit(1);
    }

    const itemRegex = /url: "(.*?)"/g;
    let match;
    const mfgUrls: string[] = [];
    while ((match = itemRegex.exec(mfgSectionMatch[1])) !== null) {
        mfgUrls.push(match[1]);
    }

    console.log(`Found ${mfgUrls.length} Manufacturing URLs in sidebar.`);

    let missingCount = 0;
    mfgUrls.forEach(url => {
        // Robust check for Route path
        const routeRegex = new RegExp(`path=["']${url}["']`, 'i');
        if (appContent.match(routeRegex)) {
            console.log(`✅ Reachable: ${url}`);
        } else {
            console.error(`❌ UNREACHABLE: ${url} (No Route found in App.tsx)`);
            missingCount++;
        }
    });

    if (missingCount === 0) {
        console.log("\n🎉 Navigation Reachability Audit: 100% SUCCESS");
    } else {
        console.error(`\n❌ Navigation Reachability Audit: FAILED (${missingCount} unreachable pages)`);
        process.exit(1);
    }
}

verifyNavigationReachability();

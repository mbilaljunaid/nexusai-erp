
import { execSync } from "child_process";

async function verifyRelease() {
    console.log("🚀 Starting GL Release Verification Sequence...\n");

    const scripts = [
        { name: "Enterprise Structure", file: "verify_enterprise_structure.ts" },
        { name: "GL Core API", file: "verify_gl_api.ts" },
        { name: "Agentic GL", file: "verify_agentic_gl.ts" }
    ];

    let passed = 0;
    let failed = 0;

    for (const script of scripts) {
        console.log(`\n==================================================`);
        console.log(`▶️  Running: ${script.name}`);
        console.log(`==================================================`);
        try {
            execSync(`npx tsx ${script.file}`, { stdio: "inherit" });
            console.log(`\n✅ ${script.name} PASSED`);
            passed++;
        } catch (error) {
            console.error(`\n❌ ${script.name} FAILED`);
            failed++;
        }
    }

    console.log(`\n\n==================================================`);
    console.log(`📊 Verification Summary`);
    console.log(`==================================================`);
    console.log(`Total:  ${scripts.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.error(`\n🛑 RELEASE CHECK FAILED. Fix issues above.`);
        process.exit(1);
    } else {
        console.log(`\n✨ ALL SYSTEMS GO. READY FOR LAUNCH. ✨`);
        process.exit(0);
    }
}

verifyRelease();

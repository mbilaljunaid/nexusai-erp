
import { execSync } from "child_process";
import "dotenv/config";

const scripts = [
    // 1. Core GL Parity & Setup
    "verify_parity_final.ts",

    // 2. Multicurrency & Revaluation
    "verify_revaluation.ts",

    // 3. Ledger Sets & Multi-Ledger
    "verify_multi_ledger.ts",

    // 4. Master Data & CVR
    "verify_gl_master_data.ts",
    "verify_cvr.ts",

    // 5. Posting Rules & Automation
    "verify_posting_rules.ts",

    // 6. Period Close
    "verify_period_close.ts",

    // 7. Advanced AI
    "verify_ai_agent.ts",

    // 8. Security (RBAC/SoD)
    "verify_security.ts"
];

console.log(`\n🚀 STARTING LEVEL-15 REVALIDATION (Runs: ${scripts.length})\n`);
console.log(`========================================================\n`);

let passed = 0;
let failed = 0;

for (const script of scripts) {
    console.log(`\n⏳ Running ${script}...`);
    try {
        // Run synchronously, inherit stdio for visibility, but verify exit code
        // We use npx tsx to execute
        execSync(`npx tsx scripts/${script}`, { stdio: "inherit" });
        console.log(`\n✅ ${script} PASSED.`);
        passed++;
    } catch (error) {
        console.error(`\n❌ ${script} FAILED.`);
        failed++;
        // We might want to stop on first failure? Or run all?
        // Let's run all to get a full report, but mark build as failed.
    }
    console.log("--------------------------------------------------------");
}

console.log(`\n========================================================`);
console.log(`REVALIDATION COMPLETE`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`========================================================\n`);

if (failed > 0) {
    console.error("🚨 REVALIDATION FAILED. Some scripts did not pass.");
    process.exit(1);
} else {
    console.log("✅ SYSTEM GREEN. ALL CHECKS PASSED.");
    process.exit(0);
}

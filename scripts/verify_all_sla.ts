
import { execSync } from "child_process";

const scripts = [
    "reset_periods.ts",
    "verify_sla_engine.ts",
    "verify_sla_explain.ts",
    "verify_parity_final.ts",
    "verify_multi_ledger.ts",
    "verify_manual_journal.ts",
    "verify_period_close.ts"
];

async function verifyAllSla() {
    console.log("🚀 Starting SLA Final Certification (Phase 17)...\n");

    for (const script of scripts) {
        console.log(`----------------------------------------------------------------`);
        console.log(`▶️ Running: ${script}`);
        console.log(`----------------------------------------------------------------`);
        try {
            execSync(`npx tsx scripts/${script}`, { stdio: "inherit", env: process.env });
            console.log(`\n✅ PASSED: ${script}\n`);
        } catch (error) {
            console.error(`\n❌ FAILED: ${script}`);
            process.exit(1);
        }
    }

    console.log("----------------------------------------------------------------");
    console.log("🎉 ALL SLA VERIFICATIONS PASSED!");
    console.log("   - Engine V2: OK");
    console.log("   - Explainability: OK");
    console.log("   - Parity (Integrations): OK");
    console.log("   - Period Close: OK");
    console.log("   - Multi-Ledger: OK");
    console.log("   - Manual Journals: OK");
    console.log("----------------------------------------------------------------");
}

verifyAllSla();

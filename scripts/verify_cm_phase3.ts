// verify_cm_phase3.ts - Verification script for Phase 3 components
import { runSweepEngine } from "../scripts/sweeper_job";
import { generatePdfReport } from "../server/utils/pdf-report-generator";
import { parserFactory } from "../server/utils/banking-parsers";
import { resolve } from "path";

async function verifyParsers() {
    console.log("[Verify] Testing MT940 parser with dummy content...");
    const dummyMt940 = ":20:12345\n:25:67890\n:60F:C200101EUR1000,00\n:61:2001020202D100,00NTRFNONREF\n:86:Test transaction description\n:62F:C200103EUR1100,00";
    const parser = parserFactory.getParser(dummyMt940);
    const result = parser.parse(dummyMt940);
    console.log("[Verify] Parsed statements:", JSON.stringify(result, null, 2));
}

async function verifyPdf() {
    console.log("[Verify] Generating dummy PDF report...");
    const dummyData = { title: "Cash Reconciliation", date: new Date().toISOString() };
    const outputPath = resolve(__dirname, "cm_report.pdf");
    await generatePdfReport(dummyData, outputPath);
    console.log(`[Verify] PDF generated at ${outputPath}`);
}

async function verifySweep() {
    console.log("[Verify] Running sweep engine (may create sweep records if DB is configured)...");
    try {
        await runSweepEngine();
        console.log("[Verify] Sweep engine completed.");
    } catch (err) {
        console.error("[Verify] Sweep engine error:", err);
    }
}

async function main() {
    await verifyParsers();
    await verifyPdf();
    await verifySweep();
    console.log("[Verify] Phase 3 verification completed.");
}

main().catch(err => console.error("[Verify] Unexpected error:", err));

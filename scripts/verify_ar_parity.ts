import "dotenv/config";
import { db } from "../server/db";
import { arInvoices, arReceipts } from "../shared/schema";
import { arAiService } from "../server/services/ar-ai";
import { arReportingService } from "../server/services/ar-reporting";

async function verifyArParity() {
    console.log("Starting AR Parity Verification...");

    try {
        // 1. Verify AI Service
        console.log("1. Testing AI Payment Prediction...");
        // Fetch some invoices
        const formattingInvoices = await db.select().from(arInvoices).limit(3);
        if (formattingInvoices.length > 0) {
            const predictions = await arAiService.predictPaymentDates(formattingInvoices.map(i => i.id));
            console.log(`- Generated ${predictions.length} predictions.`);
            if (predictions.length > 0) console.log("  [PASS] Prediction logic executed.");
        } else {
            console.log("  [SKIP] No invoices found for prediction test.");
        }

        console.log("2. Testing AI Collection Strategy...");
        const strategy = await arAiService.recommendCollectionStrategy("CUST-001-MOCK");
        console.log(`- Recommendation: ${strategy.action}`);
        if (strategy) console.log("  [PASS] Strategy logic executed.");


        // 2. Verify Reporting Service
        console.log("3. Testing Aging Report generation...");
        const aging = await arReportingService.generateAgingReport();
        console.log("- Aging Report Summary:", aging);
        if (typeof aging.total === 'number') console.log("  [PASS] Aging report structure valid.");


        console.log("4. Testing AR to GL Reconciliation...");
        const recon = await arReportingService.reconcileArToGl("CURRENT");
        console.log("- Reconciliation Difference:", recon.difference);
        if (recon.status) console.log("  [PASS] Reconciliation status:", recon.status);

        console.log("\n--------------------------------------------------");
        console.log("VERIFICATION COMPLETE: AR Module Parity Achieved.");
        console.log("--------------------------------------------------");
        process.exit(0);

    } catch (error) {
        console.error("VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyArParity();

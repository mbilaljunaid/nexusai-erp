
import { slaEngine } from "../server/modules/sla/sla.service";
import { apService } from "../server/services/ap";
import { db } from "../server/db";
import { glLedgers } from "@shared/schema";

async function verifySlaExplain() {
    console.log("🔍 Verifying AI Explainability (Trace Logs)...");

    // 1. Get Primary Ledger
    const [ledger] = await db.select().from(glLedgers).limit(1);
    if (!ledger) throw new Error("No ledger found");

    // 2. Define Payload (Standard AP Invoice)
    const payload = {
        eventClassId: "AP_INVOICE",
        eventTypeId: "AP_INVOICE_VALIDATED",
        entityId: "TRACE-TEST-001",
        entityTable: "ap_invoices",
        ledgerId: ledger.id,
        eventDate: new Date(),
        glDate: new Date(),
        currencyCode: "USD",
        amount: 1000,
        description: "AI Trace Test Invoice",
        sourceData: {
            invoiceId: 999,
            invoiceNumber: "INV-TRACE-001",
            supplierType: "VENDOR",
            amount: 1000
        }
    };

    console.log("   - Payload Prepared.");

    // 3. Call Explain API
    console.log("   - Invoking explainAccounting()...");
    const trace = await slaEngine.explainAccounting(payload);

    // 4. Analyze Results
    console.log("\n📊 Trace Log Output:");
    console.log("----------------------------------------");

    let hasSuccess = false;
    let hasDerivation = false;

    trace.steps.forEach((step, index) => {
        const symbol = step.outcome === "Success" ? "✅" : step.outcome === "Skipped" ? "⏭️" : "ℹ️";
        console.log(`${index + 1}. ${symbol} [${step.stepName}]: ${step.details}`);

        if (step.outcome === "Success") hasSuccess = true;
        if (step.stepName.includes("Derive Account")) hasDerivation = true;
    });

    console.log("----------------------------------------");

    // 5. Verification Logic
    if (trace.eventClassId !== "AP_INVOICE") throw new Error("Class ID mismatch");
    if (!hasSuccess) throw new Error("No successful steps found in trace.");
    if (!hasDerivation) console.warn("⚠️ Warning: No account derivation steps passed (Maybe no rules for AP_INVOICE?).");

    if (hasSuccess) {
        console.log("\n✅ AI Explainability Verified Successfully.");
        process.exit(0);
    } else {
        console.error("\n❌ Verification Failed.");
        process.exit(1);
    }
}

verifySlaExplain().catch(console.error);

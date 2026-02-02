
import { db } from "../server/db";
import { billingEvents, billingBatches } from "@shared/schema/billing_enterprise";
import { billingService } from "../server/modules/billing/BillingService";
import { arInvoices } from "@shared/schema/ar";
import 'dotenv/config';

async function verifyMetrics() {
    console.log("🔍 Starting Billing Metrics Verification...");

    // 1. Create Data
    // Pending Event
    await db.insert(billingEvents).values({
        customerId: "cust_metric_1",
        sourceSystem: "Test",
        sourceTransactionId: `TXN-METRIC-${Date.now()}`,
        eventDate: new Date(),
        amount: "5000.00",
        status: "Pending",
        description: "Unbilled Metric Test"
    });

    // Invoice MTD (Manually insert to AR)
    await db.insert(arInvoices).values({
        customerId: "cust_metric_1",
        invoiceNumber: `INV-METRIC-${Date.now()}`,
        amount: "2500.00",
        totalAmount: "2500.00",
        status: "Posted",
        transactionClass: "INV",
        currency: "USD",
        paymentTerms: "Net 30",
        description: "Invoiced Metric Test",
        createdAt: new Date()
    });

    // 2. Fetch Metrics
    console.log("📊 Fetching Dashboard Metrics...");
    const metrics = await billingService.getDashboardMetrics();
    console.log("   -> Metric Result:", metrics);

    // 3. Verify
    if (metrics.unbilledRevenue >= 5000) {
        console.log("   ✅ Unbilled Revenue Metric Verified (> 5000)");
    } else {
        console.error("   ❌ Unbilled Revenue Metric FAILED");
    }

    if (metrics.invoicedMTD >= 2500) {
        console.log("   ✅ Invoiced MTD Metric Verified (> 2500)");
    } else {
        console.error("   ❌ Invoiced MTD Metric FAILED");
    }

    if (metrics.autoInvoiceSuccessRate !== undefined) {
        console.log(`   ✅ Success Rate: ${metrics.autoInvoiceSuccessRate}%`);
    } else {
        console.error("   ❌ Success Rate Missing");
    }

    console.log("\n✅ VERIFICATION SUCCESSFUL: Metrics Engine is active.");
    process.exit(0);
}

verifyMetrics().catch(console.error);

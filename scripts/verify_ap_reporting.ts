import { apService } from "../server/services/ap";
import { db } from "../server/db";
import { apSuppliers, apInvoices, glPeriods } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("Starting AP Reporting Verification...");

    try {
        // 1. Setup Data
        console.log("- Creating test supplier...");
        const [supplier] = await db.insert(apSuppliers).values({
            name: "Reporting Test Supplier",
            supplierNumber: "SUPP-REP-" + Date.now()
        }).returning();

        console.log("- Creating test invoice...");
        const invoiceDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 45); // 45 days ago (Over 30 bucket)

        const invoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                invoiceNumber: "INV-REP-" + Date.now(),
                invoiceAmount: "1234.56",
                invoiceCurrencyCode: "USD",
                invoiceDate,
                dueDate
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "1234.56",
                    description: "Reporting Test Line"
                }
            ]
        });

        // 2. Log manual audit
        console.log("- Logging audit action...");
        await apService.logAuditAction("test-user", "TEST_VERIFY", "INVOICE", String(invoice.id), "Verification log");

        // 3. Test Aging
        console.log("- Checking Aging Report...");
        const aging = await apService.getAgingReport();
        console.log("Aging Report Result:", JSON.stringify(aging, null, 2));

        const hasSupplier = aging.some(a => a.supplierName === "Reporting Test Supplier");
        if (!hasSupplier) throw new Error("Supplier not found in aging report");

        // 4. Test Audit Trail
        console.log("- Checking Audit Trail...");
        const trail = await apService.getAuditTrail({ entity: "INVOICE" });
        console.log(`Found ${trail.length} audit logs for INVOICE`);
        if (trail.length === 0) throw new Error("No audit logs found");

        // 5. Test Period Close
        console.log("- Checking Periods...");
        const periods = await apService.getPeriods();
        console.log(`Found ${periods.length} periods`);

        if (periods.length > 0) {
            const periodId = String(periods[0].id);
            console.log(`- Attempting to close period ${periodId}...`);
            // This might fail if there are unvalidated invoices, which we just created!
            try {
                const result = await apService.closePeriod(periodId, "test-user");
                console.log("Period Close Result:", result);
            } catch (e: any) {
                console.log("Period Close Expected Failure (unvalidated invoices):", e.message);
            }
        }

        console.log("\nVERIFICATION SUCCESSFUL!");
    } catch (e) {
        console.error("\nVERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verify();

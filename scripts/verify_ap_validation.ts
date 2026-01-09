
import 'dotenv/config';
import { apService } from "../server/services/ap";
import { storage } from "../server/storage";
import { db } from "../server/db";

async function verifyApValidation() {
    console.log("Starting AP Validation Verification...");

    try {
        // 1. Setup Data - Create Supplier
        const supplier = await storage.createApSupplier({
            name: "Validator Supplies",
            supplierNumber: "SUP-VAL-001",
            enabledFlag: true,
            paymentTermsId: "IMMEDIATE"
        });

        // 2. Scenario A: Exact Match (No Variance)
        console.log("\n--- Scenario A: Exact Match ---");
        const validInvoice = await apService.createInvoice({
            header: {
                invoiceId: "INV-VAL-GOOD",
                invoiceNumber: "INV-VAL-GOOD",
                supplierId: supplier.id,
                invoiceDate: new Date(),
                invoiceAmount: "100.00",
                invoiceCurrencyCode: "USD",
                description: "Good Invoice"
            },
            lines: [
                { lineNumber: 1, lineType: "ITEM", amount: "100.00", description: "Item 1" }
            ]
        });

        const resA = await apService.validateInvoice(validInvoice.id);
        console.log(`Status: ${resA.status} (Expected: VALIDATED)`);
        if (resA.status !== "VALIDATED") throw new Error("Scenario A Failed");


        // 3. Scenario B: Line Variance (Header != Sum of Lines)
        console.log("\n--- Scenario B: Line Variance ---");
        const badInvoice = await apService.createInvoice({
            header: {
                invoiceId: "INV-VAL-BAD",
                invoiceNumber: "INV-VAL-BAD",
                supplierId: supplier.id,
                invoiceDate: new Date(),
                invoiceAmount: "150.00", // Mismatch with line (100)
                invoiceCurrencyCode: "USD",
                description: "Bad Invoice"
            },
            lines: [
                { lineNumber: 1, lineType: "ITEM", amount: "100.00", description: "Item 1" }
            ]
        });

        const resB = await apService.validateInvoice(badInvoice.id);
        console.log(`Status: ${resB.status} (Expected: NEEDS REVALIDATION)`);
        console.log("Holds:", resB.holds);

        if (resB.status !== "NEEDS REVALIDATION" || !resB.holds.includes("LINE_VARIANCE")) {
            throw new Error("Scenario B Failed");
        }

        console.log("\n✅ AP Validation Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyApValidation();

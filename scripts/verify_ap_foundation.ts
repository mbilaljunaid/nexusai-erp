
import 'dotenv/config';
import { apService } from "../server/services/ap";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { apSuppliers, apInvoices, apInvoiceLines } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyApFoundation() {
    console.log("Starting AP Foundation Verification...");

    try {
        // 1. Create a Test Supplier
        console.log("Creating Test Supplier...");
        const supplier = await storage.createApSupplier({
            name: "Verification Supplier",
            supplierNumber: "SUP-VERIFY-001",
            enabledFlag: true,
            paymentTermsId: "IMMEDIATE"
        });
        console.log("Supplier Created:", supplier.id);

        // 2. Create an Invoice with Lines
        console.log("Creating Invoice with Lines...");
        const invoicePayload = {
            header: {
                invoiceId: "INV-VERIFY-001",
                invoiceNumber: "INV-VERIFY-001",
                supplierId: supplier.id,
                invoiceDate: new Date(),
                invoiceAmount: "110.00",
                invoiceCurrencyCode: "USD",
                paymentCurrencyCode: "USD",
                description: "Verification Invoice"
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "100.00",
                    description: "Service Item"
                },
                {
                    lineNumber: 2,
                    lineType: "TAX",
                    amount: "10.00",
                    description: "Tax"
                }
            ]
        };

        const createdInvoice = await apService.createInvoice(invoicePayload);
        console.log("Invoice Created:", createdInvoice.id);

        // 3. Verify Persistence
        const fetchedInvoice = await apService.getInvoice(createdInvoice.id.toString());

        if (!fetchedInvoice) throw new Error("Failed to fetch created invoice");
        console.log("Fetched Invoice Header:", fetchedInvoice.invoiceNumber);

        if (fetchedInvoice.lines && fetchedInvoice.lines.length === 2) {
            console.log("✅ Verified: Invoice has 2 lines");
        } else {
            throw new Error(`Expected 2 lines, found ${fetchedInvoice.lines?.length}`);
        }

        console.log("AP Foundation Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
}

verifyApFoundation();

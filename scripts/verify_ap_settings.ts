import { db } from "../server/db";
import { apService } from "../server/services/ap";
import { apSystemParameters } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyApSettings() {
    console.log("🚀 Starting AP Settings Verification...");

    try {
        // 1. Initial Get
        console.log("Checking initial system parameters...");
        const initialParams = await apService.getSystemParameters();
        console.log("Initial Params:", initialParams);

        // 2. Update with new fields
        console.log("Updating system parameters with new configuration...");
        const updateData = {
            priceTolerancePercent: "0.10",
            qtyTolerancePercent: "0.15",
            taxTolerancePercent: "0.05",
            defaultCurrencyCode: "EUR",
            defaultPaymentTermsId: "Immediate",
            defaultPayGroup: "VENDOR",
            defaultPaymentMethod: "EFT",
            allowManualInvoiceNumber: false,
            invoiceCurrencyOverride: false,
            paymentCurrencyOverride: true,
            allowPaymentTermsOverride: false,
            accountOnValidation: true,
            accountOnPayment: false,
            allowDraftAccounting: true
        };

        const updated = await apService.updateSystemParameters(updateData);
        console.log("✅ Update Successful");

        // 3. Verify Retrieval
        console.log("Verifying retrieval of updated parameters...");
        const verified = await apService.getSystemParameters();

        if (!verified) throw new Error("Failed to retrieve parameters after update");

        const checks = [
            { field: "priceTolerancePercent", expected: "0.10" },
            { field: "qtyTolerancePercent", expected: "0.15" },
            { field: "taxTolerancePercent", expected: "0.05" },
            { field: "defaultCurrencyCode", expected: "EUR" },
            { field: "defaultPaymentTermsId", expected: "Immediate" },
            { field: "defaultPayGroup", expected: "VENDOR" },
            { field: "defaultPaymentMethod", expected: "EFT" },
            { field: "allowManualInvoiceNumber", expected: false },
            { field: "invoiceCurrencyOverride", expected: false },
            { field: "paymentCurrencyOverride", expected: true },
            { field: "allowPaymentTermsOverride", expected: false },
            { field: "accountOnValidation", expected: true },
            { field: "accountOnPayment", expected: false },
            { field: "allowDraftAccounting", expected: true }
        ];

        let failed = false;
        for (const check of checks) {
            const actual = (verified as any)[check.field];
            if (actual !== check.expected) {
                console.error(`❌ Field ${check.field} mismatch: Expected ${check.expected}, Got ${actual}`);
                failed = true;
            } else {
                console.log(`✅ Field ${check.field} verified: ${actual}`);
            }
        }

        if (failed) {
            throw new Error("Verification failed: Field mismatches detected");
        }

        console.log("\n✨ AP Settings Verification Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyApSettings();


import "dotenv/config";
import { financeService } from "./server/services/finance";
import { glPostingEngine } from "./server/gl/glPostingEngine";
import { FormMetadataAdvanced } from "./shared/types/metadata";

async function verifyGlApiRefactor() {
    console.log("Starting GL API Verification...");

    try {
        // 1. Setup Mock Data
        const formId = "invoices";
        const formData = {
            amount: 500,
            invoiceNumber: "INV-VERIFY-001"
        };
        const metadata: FormMetadataAdvanced = {
            id: "invoices",
            name: "Invoice",
            apiEndpoint: "/api/invoices",
            module: "finance",
            page: "invoices",
            version: 1,
            status: "active",
            fields: [],
            searchFields: [],
            displayField: "id",
            createButtonText: "Create",
            breadcrumbs: [],
            allowCreate: true,
            showSearch: true,
            glConfig: {
                autoCreateGL: true,
                glMappings: [],
                requireBalance: true
            }
        };

        // 2. Call Posting Engine (Service Layer)
        console.log("2. Posting GL Entries...");
        const result = await glPostingEngine.postGLEntries({
            formId,
            formData,
            metadata,
            userId: "verify-user",
            description: "Verification Journal"
        });

        console.log("   Result:", result.success ? "SUCCESS" : "FAILED");
        if (!result.success) {
            console.error("   Errors:", result.errors);
            process.exit(1);
        }

        if (!result.journalId) {
            console.error("❌ No Journal ID returned!");
            process.exit(1);
        }

        console.log("   Journal ID Created:", result.journalId);

        // 3. Verify in DB via Finance Service
        console.log("3. Verifying persistence in FinanceService...");
        const journals = await financeService.listJournals({ search: "Verification" });
        console.log(`   Found ${journals.length} journals matching 'Verification'`);

        if (journals.length === 0) {
            throw new Error("List Journals returned 0 items.");
        }

        // 4. Verify GL Stats
        console.log("4. Verifying GL Stats...");
        const stats = await financeService.getGLStats();
        console.log("   Stats:", JSON.stringify(stats, null, 2));

        if (stats.totalJournals === 0) {
            throw new Error("Stats reported 0 total journals.");
        }

        console.log("✅ GL Engine & UI Data Verified.");
        process.exit(0);

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyGlApiRefactor();

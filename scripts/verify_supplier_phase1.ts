import { supplierPortalService } from "../server/services/SupplierPortalService";
import { db } from "../server/db";
import { suppliers, supplierSites, supplierOnboardingRequests } from "../shared/schema/scm";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("🔍 Starting Supplier Portal Phase 1 Verification...");

    try {
        // 1. Submit a registration request
        const mockRequest = {
            companyName: "Global Logistics Ltd " + Date.now(),
            taxId: "TAX-999-888",
            contactEmail: "onboarding@globallogistics.com",
            phone: "+1-555-0199",
            businessClassification: "SME",
            bankAccountName: "Global Logistics Ltd",
            bankAccountNumber: "IBAN-DE-88-0000",
            bankRoutingNumber: "DEUTDEFFXXX",
            notes: "Prospective supplier for European operations"
        };

        console.log("  Step 1: Submitting registration request...");
        const request = await supplierPortalService.submitRegistration(mockRequest);
        console.log(`  ✅ Request created with ID: ${request.id}, Status: ${request.status}`);

        if (request.status !== 'PENDING') throw new Error("Request should be PENDING");

        // 2. Approve the request
        console.log("  Step 2: Approving registration request...");
        const reviewerId = "verify-bot";
        const newSupplier = await supplierPortalService.approveRegistration(request.id, reviewerId);
        console.log(`  ✅ Supplier approved. New Supplier ID: ${newSupplier.id}`);

        // 3. Verify Master Data creation
        console.log("  Step 3: Verifying Supplier Master data...");
        const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, newSupplier.id));
        if (!supplier || supplier.name !== mockRequest.companyName) {
            throw new Error("Supplier record missing or mismatched");
        }
        console.log("  ✅ Supplier Master record verified");

        // 4. Verify Site creation
        console.log("  Step 4: Verifying Supplier Site data...");
        const [site] = await db.select().from(supplierSites).where(eq(supplierSites.supplierId, newSupplier.id));
        if (!site || site.siteName !== 'HEADQUARTERS') {
            throw new Error("Supplier primary site missing");
        }
        console.log("  ✅ Primary Site verified");

        // 5. Verify Request status update
        console.log("  Step 5: Verifying Onboarding Request status...");
        const [finalRequest] = await db.select().from(supplierOnboardingRequests).where(eq(supplierOnboardingRequests.id, request.id));
        if (finalRequest.status !== 'APPROVED') {
            throw new Error("Request status not updated to APPROVED");
        }
        console.log("  ✅ Request status verified as APPROVED");

        console.log("\n🎉 Supplier Portal Phase 1 Verification SUCCESSFUL!");
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verify();

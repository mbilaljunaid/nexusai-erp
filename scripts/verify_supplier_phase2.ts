import { contractService } from "../server/services/ContractService";
import { db } from "../server/db";
import { procurementContracts, contractClauses, contractTerms, suppliers, purchaseOrders } from "../shared/schema/scm";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("🔍 Starting Supplier Portal Phase 2 Verification...");

    try {
        // 0. Setup: Ensure a supplier exists
        const [supplier] = await db.select().from(suppliers).limit(1);
        if (!supplier) throw new Error("No supplier found for testing. Run Phase 1 verification first.");
        console.log(`  Using supplier: ${supplier.name}`);

        // 1. Seed Library
        console.log("  Step 1: Seeding Clause Library...");
        await contractService.seedClauseLibrary();
        const clauses = await db.select().from(contractClauses);
        console.log(`  ✅ Library seeded with ${clauses.length} standard clauses`);

        // 2. Create Contract
        console.log("  Step 2: Creating Procurement Contract...");
        const contractData = {
            supplierId: supplier.id,
            contractNumber: "CONT-2026-001",
            title: "Global Supply Agreement 2026",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            totalAmountLimit: "50000.00",
            paymentTerms: "Net-30"
        };
        const contract = await contractService.createContract(contractData);
        console.log(`  ✅ Contract created with ID: ${contract.id}`);

        // 3. Add Clauses & Terms
        console.log("  Step 3: Adding Terms from Library...");
        const paymentClause = clauses.find(c => c.category === 'PAYMENT');
        if (!paymentClause) throw new Error("Payment clause not found");

        // Add standard term
        await contractService.addClauseToContract(contract.id, paymentClause.id);

        // Add amended term (AI target)
        const legalClause = clauses.find(c => c.category === 'LEGAL');
        if (!legalClause) throw new Error("Legal clause not found");
        await contractService.addClauseToContract(contract.id, legalClause.id, "Parties shall keep info secret except for marketing purposes.");
        console.log("  ✅ Terms added (Standard + Amended)");

        // 4. Verify AI Analysis linkage
        console.log("  Step 4: Running AI Compliance Analysis (Simulation)...");
        // Since real OpenAI calls might fail in restricted CI or without keys, we check the logic path
        // If OPENAI_API_KEY is dummy, it will log an error but we verify the service method exists and executes
        const analysis = await contractService.analyzeContractCompliance(contract.id);
        console.log(`  ✅ Analysis processed for ${analysis.length} clauses`);

        // 5. Verify PO Compliance
        console.log("  Step 5: Verifying Transactional Compliance (Spend vs Limit)...");
        // Create a mock PO that exceeds the 50k limit
        const [po] = await db.insert(purchaseOrders).values({
            supplierId: supplier.id,
            orderNumber: "PO-VERIFY-LIMIT",
            totalAmount: "60000.00",
            status: "DRAFT"
        }).returning();

        // Set contract to ACTIVE so it is picked up by validator
        await db.update(procurementContracts).set({ status: 'ACTIVE' }).where(eq(procurementContracts.id, contract.id));

        const complianceResult = await contractService.validatePOCompliance(po.id);
        console.log(`  ✅ Compliance Result: ${complianceResult.compliant ? 'COMPLIANT' : 'BREACH'}`);
        console.log(`  Message: ${complianceResult.message}`);

        if (complianceResult.compliant === true) {
            throw new Error("Validation failed to flag over-limit PO");
        }

        console.log("\n🎉 Supplier Portal Phase 2 Verification SUCCESSFUL!");
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verify();

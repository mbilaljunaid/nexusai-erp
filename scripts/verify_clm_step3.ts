
import "dotenv/config";
import { db } from "@db";
import { contracts, contractLines, contractDocuments } from "@shared/schema/contracts";
import { eq } from "drizzle-orm";

async function verifyStep3() {
    console.log("Starting Phase 16 Step 3 Verification: Lines & Documents...");

    try {
        // 1. Get/Create Contract
        let [contract] = await db.select().from(contracts).limit(1);
        if (!contract) {
            console.log("Creating test contract...");
            [contract] = await db.insert(contracts).values({
                title: "Verify Step 3 Contract",
                contractNumber: `VS3-${Date.now()}`,
                startDate: new Date(),
                status: "DRAFT"
            }).returning();
        }

        console.log(`Using Contract: ${contract.contractNumber}`);

        // 2. Add Line
        console.log("Adding Line Item...");
        const [line] = await db.insert(contractLines).values({
            contractId: contract.id,
            lineNumber: 1,
            itemDescription: "Test Service Line",
            quantity: "10",
            unitPrice: "150.00",
            lineAmount: "1500.00",
            status: "OPEN"
        }).returning();

        if (!line) throw new Error("Failed to insert contract line");
        console.log("✅ Line Item Added");

        // 3. Add Document
        console.log("Adding Document...");
        const [doc] = await db.insert(contractDocuments).values({
            contractId: contract.id,
            documentName: "Executed_Agreement.pdf",
            documentType: "CONTRACT",
            url: "s3://test/executed.pdf",
            uploadedBy: "SCRIPT"
        }).returning();

        if (!doc) throw new Error("Failed to insert contract document");
        console.log("✅ Document Added");

        // 4. Verify Fetch
        const fetchedLines = await db.select().from(contractLines).where(eq(contractLines.contractId, contract.id));
        const fetchedDocs = await db.select().from(contractDocuments).where(eq(contractDocuments.contractId, contract.id));

        console.log(`Fetched Lines: ${fetchedLines.length}`);
        console.log(`Fetched Docs: ${fetchedDocs.length}`);

        if (fetchedLines.length === 0 || fetchedDocs.length === 0) {
            throw new Error("Fetch verification failed.");
        }

        console.log("\n✅ PHASE 16 STEP 3 VERIFICATION PASSED");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyStep3();


import "dotenv/config";
import { db } from "../server/db";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { icBatches, icHeaders } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🧪 Verifying Transfer Pricing Logic...");

    const providerId = "ICO-101";
    const receiverId = "ICO-102";
    const userId = "test-user";

    // 1. Create a Batch
    console.log(`Creating Batch: ${providerId} -> ${receiverId} (Amount: 100)...`);
    const batch = await intercompanyService.createBatch({
        description: "TP Verification Test",
        initiatorOrgId: providerId,
        glDate: new Date().toISOString().split('T')[0],
        currencyCode: "USD",
        transactions: [
            {
                receiverOrgId: receiverId,
                transactionTypeId: "SHARED_SERVICES", // Assuming this exists from Phase 1 seed
                amount: 100.00,
                lines: [
                    {
                        codeCombinationId: "101-00-5000",
                        enteredCr: 100.00,
                        description: "Consulting Revenue"
                    }
                ]
            }
        ]
    }, userId);

    console.log(`Batch Created: ${batch.id}`);

    // 2. Fetch Header to verify amount
    const headers = await db.select().from(icHeaders).where(eq(icHeaders.batchId, batch.id));
    const header = headers[0];

    console.log("Header Details:", {
        amount: header.amount,
        markupRate: header.markupRate,
        provider: header.providerOrgId,
        receiver: header.receiverOrgId
    });

    // 3. Assertions
    const expectedAmount = 115.00; // 100 + 15%
    const expectedRate = 0.15;

    if (Number(header.amount) === expectedAmount && Number(header.markupRate) === expectedRate) {
        console.log("✅ SUCCESS: Transfer Pricing Applied Correctly!");
    } else {
        console.error("❌ FAILURE: Markup Validation Failed.");
        console.error(`Expected Amount: ${expectedAmount}, Got: ${header.amount}`);
        console.error(`Expected Rate: ${expectedRate}, Got: ${header.markupRate}`);
        process.exit(1);
    }

    process.exit(0);
}

main().catch(err => {
    console.error("Test Failed:", err);
    process.exit(1);
});

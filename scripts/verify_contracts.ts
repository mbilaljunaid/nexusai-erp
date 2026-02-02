
import "dotenv/config";
import { db } from "../server/db";
import { contracts } from "../shared/schema";
import { ilike, eq } from "drizzle-orm";
import { ContractService } from "../server/services/ContractService";
import { format, addDays } from "date-fns";

async function verifyContracts() {
    console.log("🚀 Starting verification for Sales Contracts (Phase 28)...");

    try {
        const title = `MSA Test ${Date.now()}`;

        // 1. Create Contract
        const contract = await ContractService.createContract({
            title,
            type: "MSA",
            totalValue: 50000,
            startDate: new Date(),
            endDate: addDays(new Date(), 20) // Expiring soon (<30 days)
        });
        console.log(`✅ Created Contract: ${contract.title} (${contract.contractNumber})`);

        if (contract.status !== 'Draft') throw new Error("Contract should start as Draft");

        // 2. Activate
        const activated = await ContractService.updateContract(contract.id, { status: "Active" });
        console.log(`✅ Activated Contract: Status is now ${activated.status}`);

        // 3. Check Expiring Alert
        const expiring = await ContractService.getExpiringContracts(30);
        const found = expiring.find(c => c.id === contract.id);

        if (!found) throw new Error("Contract should be in expiring list (20 days left)");
        console.log(`✅ Detected Expiring Contract: ${found.title}`);

        // Cleanup
        await db.delete(contracts).where(eq(contracts.id, contract.id));

        console.log("✅ Verification Passed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyContracts();

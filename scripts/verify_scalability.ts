
import "dotenv/config";
import { db } from "../server/db";
import { contracts, dealRegistrations } from "../shared/schema";
import { ContractService } from "../server/services/ContractService";
import { PartnerService } from "../server/services/PartnerService";

async function verifyScalability() {
    console.log("🚀 Starting Scalability Verification...");

    // 1. Seed Data if needed (ensure enough records for pagination)
    console.log("1️⃣ Verifying Contract Pagination...");
    // Create 5 dummy contracts if less than 5
    const currentContracts = await db.select().from(contracts);
    if (currentContracts.length < 5) {
        console.log("Seeding dummy contracts...");
        for (let i = 0; i < 5; i++) {
            await ContractService.createContract({
                title: `Pagination Test Contract ${i}`,
                type: 'MSA',
                totalValue: 1000 + i,
                startDate: new Date(),
            });
        }
    }

    // Test Pagination (Limit 2)
    const page1 = await ContractService.getAllContracts(undefined, 1, 2);
    console.log(`   Page 1 (Limit 2): Returned ${page1.data.length} items. Total: ${page1.total}`);

    if (page1.data.length !== 2) throw new Error("Contract Pagination Page 1 failed");
    if (page1.page !== 1) throw new Error("Contract Pagination Page 1 metadata incorrect");

    const page2 = await ContractService.getAllContracts(undefined, 2, 2);
    console.log(`   Page 2 (Limit 2): Returned ${page2.data.length} items.`);

    if (page2.data[0].id === page1.data[0].id) throw new Error("Contract Pagination failed: Page 1 and 2 start with same item");

    console.log("   ✅ Contract Pagination Verified");

    // 2. Partner Deal Pagination
    console.log("2️⃣ Verifying Partner Deal Pagination...");
    // Ensure partner exists
    let partner = await PartnerService.ensurePartner("Test Partner", "test@partner.com");

    const currentDeals = await db.select().from(dealRegistrations);
    if (currentDeals.length < 5) {
        console.log("Seeding dummy deals...");
        for (let i = 0; i < 5; i++) {
            await PartnerService.registerDeal({
                partnerId: partner.id,
                dealName: `Pagination Deal ${i}`,
                estimatedValue: 5000,
                customerName: "Test Customer",
                contactPerson: "John Doe",
                email: "john@example.com"
            });
        }
    }

    const dealPage1 = await PartnerService.getAllDeals(1, 2);
    console.log(`   Page 1 (Limit 2): Returned ${dealPage1.data.length} items. Total: ${dealPage1.total}`);

    if (dealPage1.data.length !== 2) throw new Error("Partner Deal Pagination Page 1 failed");

    console.log("   ✅ Partner Deal Pagination Verified");

    console.log("🎉 Scalability Verification PASSED");
    process.exit(0);
}

verifyScalability().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});

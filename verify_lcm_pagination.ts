
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";

async function verifyLcmPagination() {
    console.log("📈 Verifying LCM Phase 37: Scalability (Pagination)...");

    try {
        // 1. Seed Data: Ensure we have at least 15 ops
        console.log("   --- Seeding Data ---");
        for (let i = 0; i < 15; i++) {
            await lcmService.createTradeOperation({
                operationNumber: `TO-SCALE-${Date.now()}-${i}`,
                name: `Scalability Test Op ${i}`
            });
        }
        console.log("   ✅ Seeded 15 Trade Ops.");

        // 2. Fetch Page 1 (Limit 10)
        console.log("   --- Testing Page 1 (Limit 10) ---");
        const page1 = await lcmService.listTradeOperations(1, 10);
        console.log(`   Fetched Page 1: ${page1.data.length} records. Total: ${page1.total}`);

        if (page1.data.length !== 10) throw new Error(`Expected 10 records, got ${page1.data.length}`);
        if (page1.page !== 1) throw new Error("Page meta incorrect");

        // 3. Fetch Page 2
        console.log("   --- Testing Page 2 ---");
        const page2 = await lcmService.listTradeOperations(2, 10);
        console.log(`   Fetched Page 2: ${page2.data.length} records.`);

        if (page2.data.length < 5) throw new Error("Expected at least 5 records on page 2");

        console.log("🎉 Phase 37 (Scalability) Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyLcmPagination();

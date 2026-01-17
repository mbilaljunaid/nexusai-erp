
import "dotenv/config";
import { db } from "./server/db";
import { wmsTasks } from "./shared/schema/scm";
import { wmsTaskService } from "./server/modules/inventory/wms-task.service";
import { eq } from "drizzle-orm";

async function verifyPagination() {
    console.log("🧠 Verifying WMS Task Pagination...");

    try {
        const warehouseId = "PAGINATION-TEST-ORG";

        // 1. Setup: Create 150 tasks
        console.log("   Seeding 150 Tasks...");
        const tasksToInsert = [];
        for (let i = 0; i < 150; i++) {
            // Basic task structure
            tasksToInsert.push({
                taskNumber: `PAG-TSK-${i}-${Date.now()}`,
                warehouseId,
                taskType: "COUNT",
                itemId: "ITEM-X",
                quantityPlanned: "1",
                status: "PENDING"
            });
        }

        // Bulk insert not supported by helper, loop insert or use db.insert
        await db.insert(wmsTasks).values(tasksToInsert);
        console.log("   ✅ Seeded.");

        // 2. Fetch Page 1 (Limit 50)
        console.log("   Fetching Page 1 (Limit 50)...");
        const page1 = await wmsTaskService.listTasks({ warehouseId, limit: 50, page: 1 });

        if (page1.data.length !== 50) throw new Error(`Page 1 length mismatch. Got ${page1.data.length}`);
        if (page1.page !== 1) throw new Error("Page number mismatch");
        if (page1.total < 150) throw new Error("Total count invalid");
        console.log("   ✅ Page 1 OK: 50 items returned.");

        // 3. Fetch Page 2
        console.log("   Fetching Page 2...");
        const page2 = await wmsTaskService.listTasks({ warehouseId, limit: 50, page: 2 });
        if (page2.data.length !== 50) throw new Error(`Page 2 length mismatch. Got ${page2.data.length}`);
        console.log("   ✅ Page 2 OK.");

        // 4. Verify Content (Should be different)
        if (page1.data[0].id === page2.data[0].id) throw new Error("Page 1 and Page 2 start with same item");
        console.log("   ✅ Pagination Logic Verified.");

        // Cleanup
        await db.delete(wmsTasks).where(eq(wmsTasks.warehouseId, warehouseId));
        console.log("   ✅ Cleanup Complete.");

        console.log("🎉 Pagination Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyPagination();


import { db } from "../server/db";
import { serviceWorkOrders, serviceAppointments } from "../shared/schema";
import { eq } from "drizzle-orm";
import { FieldServiceService } from "../server/services/FieldServiceService";

async function verifyFieldService() {
    console.log("🚀 Starting verification for Field Service (Phase 26)...");

    let woId: string = "";

    try {
        // 1. Create Work Order
        const wo = await FieldServiceService.createWorkOrder({
            subject: "Fix AC Unit",
            priority: "High",
            street: "123 Main St",
            city: "New York"
        });
        woId = wo.id;
        console.log(`✅ Created WO: ${wo.workOrderNumber} (Status: ${wo.status})`);

        // 2. Assign Technician
        const start = new Date();
        const end = new Date(start.getTime() + 3600000); // +1hr
        await FieldServiceService.assignTechnician(woId, "tech-1", start, end);

        // Verify Status Change
        const [updatedWo] = await db.select().from(serviceWorkOrders).where(eq(serviceWorkOrders.id, woId));
        if (updatedWo.status !== "Scheduled") throw new Error("Status did not update to Scheduled");
        console.log("✅ Assigned Technician. Status: Scheduled");

        // 3. Complete WO
        await FieldServiceService.completeWorkOrder(woId);

        const [completedWo] = await db.select().from(serviceWorkOrders).where(eq(serviceWorkOrders.id, woId));
        if (completedWo.status !== "Completed") throw new Error("Status did not update to Completed");
        console.log("✅ Work Order Completed");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(serviceAppointments).where(eq(serviceAppointments.workOrderId, woId));
        await db.delete(serviceWorkOrders).where(eq(serviceWorkOrders.id, woId));
        console.log("✅ Cleanup complete");

        process.exit(0);

    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        try {
            if (woId) {
                await db.delete(serviceAppointments).where(eq(serviceAppointments.workOrderId, woId));
                await db.delete(serviceWorkOrders).where(eq(serviceWorkOrders.id, woId));
            }
        } catch (e) { }
        process.exit(1);
    }
}

verifyFieldService();

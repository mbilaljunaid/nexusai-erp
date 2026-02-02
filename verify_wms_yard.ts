
import "dotenv/config";
import { db } from "./server/db";
import { wmsDockAppointments } from "./shared/schema/scm";
import { wmsYardService } from "./server/modules/inventory/wms-yard.service";
import { eq } from "drizzle-orm";

async function verifyYard() {
    console.log("🧠 Verifying Yard Management...");

    try {
        const warehouseId = "YARD-TEST-ORG";
        const today = new Date();

        // 1. Create Appointment
        console.log("   Creating Appointment...");
        const appt = await wmsYardService.createAppointment({
            warehouseId,
            dockNumber: "D-99",
            carrier: "TEST-CARRIER",
            appointmentTime: today,
            status: "SCHEDULED",
            referenceNumber: "PO-YARD-TEST"
        });
        console.log("   ✅ Created: " + appt.id);

        // 2. List Appointments
        console.log("   Listing Appointments...");
        const list = await wmsYardService.listAppointments(warehouseId, today);
        if (list.length !== 1) throw new Error("List failed");
        console.log("   ✅ List OK");

        // 3. Update Status
        console.log("   Updating Status...");
        const updated = await wmsYardService.updateStatus(appt.id, "ARRIVED");
        if (updated.status !== "ARRIVED") throw new Error("Update failed");
        console.log("   ✅ Status Updated to ARRIVED");

        // Cleanup
        await db.delete(wmsDockAppointments).where(eq(wmsDockAppointments.id, appt.id));

        console.log("🎉 Yard Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyYard();

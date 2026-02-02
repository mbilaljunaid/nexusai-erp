
import "dotenv/config";
import { db } from "../server/db";
import { orderManagementService } from "../server/modules/order/OrderManagementService";
import { PpmService } from "../server/services/PpmService";
import { omOrderLines } from "../shared/schema/order_management";
import { eq } from "drizzle-orm";

const ppmService = new PpmService();

async function verifyProjectIntegration() {
    console.log("🏗️ Verifying Project-Driven Supply Chain...");

    try {
        // 1. Create a Project and Task
        console.log("1. Creating Project Structure...");
        const project = await ppmService.createProject({
            projectNumber: `PROJ-${Date.now()}`,
            name: "Construction of New Hangar",
            projectType: "CAPITAL",
            startDate: new Date(),
            status: "ACTIVE"
        });
        console.log(`   Project Created: ${project.name} (${project.projectNumber})`);

        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "1.0",
            name: "Site Preparation",
            startDate: new Date(),
            chargeableFlag: true,
            billableFlag: true
        });
        console.log(`   Task Created: ${task.name}`);

        // 2. Create an Order linked to this Project
        console.log("2. Creating Project-Linked Order...");
        const headerData = {
            customerId: "CUST-PROJ-001",
            currency: "USD",
            orderType: "STANDARD"
        };
        const linesData = [
            {
                itemId: "ITEM-CEMENT",
                orderedQuantity: 100,
                unitSellingPrice: 15.00,
                projectId: project.id,
                taskId: task.id
            }
        ];

        const order = await orderManagementService.createOrder({ header: headerData, lines: linesData });
        console.log(`   Order Created: ${order.orderNumber}`);

        // 3. Verify Link in Database
        console.log("3. Verifying Database Link...");
        const [line] = await db.select().from(omOrderLines).where(eq(omOrderLines.headerId, order.id));

        if (line.projectId === project.id && line.taskId === task.id) {
            console.log("   ✅ Order Line correctly linked to Project & Task.");
        } else {
            throw new Error(`Link Mismatch. Expected ${project.id}/${task.id}, Got ${line.projectId}/${line.taskId}`);
        }

        console.log("✅ PROJECT INTEGRATION VERIFIED");
        process.exit(0);

    } catch (e) {
        console.error("❌ VERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verifyProjectIntegration();

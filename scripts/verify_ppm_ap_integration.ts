import { db } from "../server/db";
import { ppmService } from "../server/services/PpmService";
import { apService } from "../server/services/ap";
import { storage } from "../server/storage";
import {
    ppmProjects, ppmTasks, apInvoices, apInvoiceLines,
    ppmExpenditureItems, apSuppliers
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyPpmApIntegration() {
    console.log("🚀 Starting AP-PPM Cost Collection Verification...");

    try {
        // 1. Setup Project & Task
        console.log("\n🧪 Step 1: Setting up PPM Project and Task...");
        const project = await ppmService.createProject({
            projectNumber: `PRJ-AP-${Date.now()}`,
            name: "AP Integration Test Project",
            projectType: "INDIRECT",
            startDate: new Date(),
            status: "ACTIVE"
        });

        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "T1",
            name: "Collection Task",
            startDate: new Date(),
            chargeableFlag: true
        });
        console.log(`   ✅ Project: ${project.projectNumber}, Task: ${task.taskNumber}`);

        // 2. Setup Supplier
        console.log("\n🧪 Step 2: Ensuring Supplier exists...");
        let [supplier] = await db.select().from(apSuppliers).limit(1);
        if (!supplier) {
            supplier = await storage.createApSupplier({
                name: "Test Project Vendor",
                supplierNumber: "VEND-PPM-001"
            });
        }
        console.log(`   ✅ Supplier: ${supplier.name}`);

        // 3. Create AP Invoice charged to PPM
        console.log("\n🧪 Step 3: Creating AP Invoice linked to PPM...");
        const invoiceData = {
            header: {
                invoiceNumber: `INV-PPM-${Date.now()}`,
                supplierId: supplier.id,
                invoiceAmount: "1250.00",
                invoiceDate: new Date(),
                invoiceStatus: "DRAFT"
            },
            lines: [{
                lineNumber: 1,
                amount: "1250.00",
                lineType: "ITEM",
                description: "Consulting fees charged to project",
                ppmProjectId: project.id,
                ppmTaskId: task.id
            }]
        };
        const invoice = await apService.createInvoice(invoiceData as any);
        console.log(`   ✅ Invoice Created: ${invoice.invoiceNumber}`);

        // 4. Validate Invoice
        console.log("\n🧪 Step 4: Validating Invoice...");
        await apService.validateInvoice(invoice.id);
        const [updatedInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id));
        console.log(`   ✅ Validation Status: ${updatedInvoice.validationStatus}`);

        if (updatedInvoice.validationStatus !== "VALIDATED") {
            throw new Error("Invoice was not validated successfully");
        }

        // 5. Run PPM Collection
        console.log("\n🧪 Step 5: Running PPM Collection Engine...");
        const collectedItems = await ppmService.collectFromAP();
        console.log(`   ✅ Collected ${collectedItems.length} expenditure items`);

        if (collectedItems.length === 0) {
            throw new Error("PPM Collection failed to pick up the validated invoice line");
        }

        // 6. Verify Linkage
        console.log("\n🧪 Step 6: Verifying data integrity and linkage...");
        const [collectedItem] = collectedItems;
        const [apLine] = await db.select().from(apInvoiceLines).where(eq(apInvoiceLines.invoiceId, invoice.id));

        console.log(`   ✅ PPM Exp Item ID: ${collectedItem.id}`);
        console.log(`   ✅ AP Line Linked to PPM Exp Item: ${apLine.ppmExpenditureItemId}`);

        if (apLine.ppmExpenditureItemId !== collectedItem.id) {
            throw new Error("Linkage mismatch between AP Line and PPM Expenditure Item");
        }

        if (parseFloat(collectedItem.rawCost) !== 1250.00) {
            throw new Error(`Cost mismatch. Expected 1250.00, got ${collectedItem.rawCost}`);
        }

        console.log("\n✨ AP-PPM Cost Collection Verified Successfully!");
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyPpmApIntegration();

import "dotenv/config";
import { db } from "../server/db";
import { arDunningTemplates, arDunningRuns, arCollectorTasks, arInvoices, arCustomers } from "@shared/schema";
import { arService } from "../server/services/ar";
import { eq, sql } from "drizzle-orm";

async function verify() {
    console.log("Starting AR Collections Verification...");

    // 1. Setup: Create overdue invoice
    console.log("1. Seeding Overdue Invoice...");
    // Create customer
    const cust = await arService.createCustomer({
        name: "Verification Customer",
        customerType: "Commercial",
        contactEmail: "verify@test.com"
    });
    // Create invoice
    const inv = await arService.createInvoice({
        customerId: cust.id,
        invoiceNumber: `VERIFY-INV-${Date.now()}`,
        amount: "1000",
        taxAmount: "100",
        totalAmount: "1100",
        currency: "USD",
        status: "Sent", // Will mock as overdue by backdating
        transactionClass: "INV",
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days overdue
    });
    console.log(`- Created Invoice ${inv.invoiceNumber} with due date 30 days ago`);

    // 2. Create Template
    console.log("2. Creating Dunning Template...");
    const tmpl = await arService.createDunningTemplate({
        name: "30 Days Overdue",
        subject: "Payment Reminder",
        content: "Your invoice is 30 days overdue.",
        daysOverdueMin: 29,
        daysOverdueMax: 60,
        severity: "Medium"
    });
    console.log("- Created Template '30 Days Overdue'");

    // 3. Execute Dunning Run
    console.log("3. Executing Dunning Run...");
    const { run, tasks } = await arService.createDunningRun();
    console.log(`- Run ID: ${run.id}`);
    console.log(`- Tasks Created: ${tasks}`);

    if (tasks < 1) {
        throw new Error("No tasks created! Expected at least 1 for the overdue invoice.");
    }

    // 4. Verify Task Creation
    console.log("4. Verifying Task...");
    const taskList = await arService.listCollectorTasks();
    const myTask = taskList.find(t => t.invoiceId === inv.id);

    if (!myTask) {
        throw new Error(`Task not found for invoice ${inv.id}`);
    }
    console.log(`- Found Task ${myTask.id} for Invoice ${inv.invoiceNumber}`);
    console.log(`- Task Type: ${myTask.taskType}, Priority: ${myTask.priority}`);

    // 5. Generate AI Email
    console.log("5. Generating AI Email...");
    const emailBody = await arService.generateAiCollectionEmail(inv.id);
    console.log("- Generated Email/Letter Content:");
    console.log(emailBody);

    if (!emailBody.includes(inv.invoiceNumber)) {
        throw new Error("Email body does not contain invoice number!");
    }

    console.log("Verification successful!");
    process.exit(0);
}

verify().catch(err => {
    console.error("Verification failed:", err);
    process.exit(1);
});

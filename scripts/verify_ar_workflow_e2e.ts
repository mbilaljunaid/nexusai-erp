
import { executeTool } from "../server/services/nexus-tool-executor";
import { db } from "../server/db";
import { arCustomers, arCustomerAccounts, arCustomerSites, arInvoices, arReceipts } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyARWorkflow() {
    console.log("🔍 Starting End-to-End AR Workflow Verification...");

    const timestamp = Date.now();
    const testCustomerName = `AR-Test-Corp-${timestamp}`;

    try {
        // 1. Seed Prerequisites (Customer, Account, Site)
        console.log("🌱 Seeding prerequisites...");

        // Create Customer
        const [customer] = await db.insert(arCustomers).values({
            name: testCustomerName,
            customerType: "Commercial",
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date()
        } as any).returning();

        if (!customer) throw new Error("Failed to seed customer");
        console.log(`   Customer created: ${customer.id}`);

        // Create Account
        const [account] = await db.insert(arCustomerAccounts).values({
            customerId: customer.id,
            accountNumber: `ACC-${timestamp}`,
            accountName: "Main Test Account",
            status: "Active",
            paymentTerms: "Net 30",
            currency: "USD",
            createdAt: new Date(),
            updatedAt: new Date()
        } as any).returning();

        if (!account) throw new Error("Failed to seed account");
        console.log(`   Account created: ${account.id}`);

        // Create Site
        const [site] = await db.insert(arCustomerSites).values({
            accountId: account.id,
            siteName: "HQ - Billing",
            address: "123 Test Lane",
            city: "Test City",
            country: "US",
            isBillTo: true,
            isShipTo: true,
            status: "Active",
            createdAt: new Date(),
            updatedAt: new Date()
        } as any).returning();

        if (!site) throw new Error("Failed to seed site");
        console.log(`   Site created: ${site.id}`);

        // 2. Execute Tool: Create AR Invoice
        console.log("🚀 Executing AI Tool: create_ar_invoice...");
        const invoiceParams = {
            customerId: customer.id,
            accountId: account.id,
            siteId: site.id,
            invoiceNumber: `INV-${timestamp}`,
            amount: "1500.00",
            currency: "USD",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Consulting Services - E2E Test"
        };

        const invoiceResult = await executeTool({
            toolName: "create_ar_invoice",
            parameters: invoiceParams,
            userRole: "admin",
            userId: "test-script"
        });

        console.log("   Tool Result:", invoiceResult);

        if (!invoiceResult.success) {
            throw new Error(`Invoice creation failed: ${invoiceResult.error}`);
        }

        const createdInvoice = invoiceResult.result.invoice;
        if (!createdInvoice) throw new Error("No invoice returned in result");

        // Verify Invoice in DB
        const [dbInvoice] = await db.select().from(arInvoices).where(eq(arInvoices.id, createdInvoice.id));
        if (!dbInvoice) throw new Error("Invoice not found in DB");
        console.log("✅ Invoice verified in DB");


        // 3. Execute Tool: Simulate Collection Run
        console.log("🚀 Executing AI Tool: simulate_collection_run...");
        const collectionResult = await executeTool({
            toolName: "simulate_collection_run",
            parameters: {},
            userRole: "admin",
            userId: "test-script"
        });

        console.log("   Tool Result:", collectionResult);
        if (!collectionResult.success) {
            throw new Error(`Collection simulation failed: ${collectionResult.error}`);
        }
        console.log("✅ Collection simulation verified");

        // 4. (Optional) Create Receipt - Check if supported if I found it. 
        // If not supported as a tool, we skip AI verification for it, but maybe verify directly if needed.
        // For now, let's assume successful Invoice creation and Collection sim is enough for "Workflows" in Phase 14 context.

        // Cleanup
        console.log("🧹 Cleaning up...");
        await db.delete(arInvoices).where(eq(arInvoices.id, createdInvoice.id));
        await db.delete(arCustomerSites).where(eq(arCustomerSites.id, site.id));
        await db.delete(arCustomerAccounts).where(eq(arCustomerAccounts.id, account.id));
        await db.delete(arCustomers).where(eq(arCustomers.id, customer.id));
        console.log("✨ Cleanup complete");

        process.exit(0);

    } catch (error) {
        console.error("❌ Test Failed:", error);
        process.exit(1);
    }
}

verifyARWorkflow();

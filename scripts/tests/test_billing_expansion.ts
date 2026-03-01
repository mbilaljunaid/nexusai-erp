import { db } from "../../server/db";
import { arService } from "../../server/services/ar";
import { arPaymentSchedules, arRecurringInvoices, arConsolidatedStatements } from "../../shared/schema/ar";
import { eq, sql } from "drizzle-orm";

async function main() {
    console.log("==========================================");
    console.log("🚀 STARTING Billing Expansion Verification");
    console.log("==========================================\n");

    try {
        // 0. Ensure an Open GL Period exists for today's SLA Accounting
        console.log("📅 Ensuring Open GL Period...");
        const ledgerId = "PRIMARY"; // Default system ledger
        const today = new Date();
        const periodName = `${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;

        const fiscalYear = today.getFullYear();
        const existingPeriod = await db.execute(sql`SELECT id FROM gl_periods WHERE ledger_id = ${ledgerId} AND period_name = ${periodName}`);

        if (existingPeriod.length > 0) {
            await db.execute(sql`UPDATE gl_periods SET status = 'Open' WHERE ledger_id = ${ledgerId} AND period_name = ${periodName}`);
        } else {
            await db.execute(sql`
                INSERT INTO gl_periods (id, ledger_id, period_name, status, start_date, end_date, fiscal_year)
                VALUES (gen_random_uuid(), ${ledgerId}, ${periodName}, 'Open', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day'), ${fiscalYear})
            `);
        }

        console.log(`✅ GL Period '${periodName}' is now Open.\n`);

        // 1. Setup a dummy customer
        console.log("📦 Creating Test Customer...");
        const customer = await arService.createCustomer({
            partyType: "ORGANIZATION",
            name: "Billing Expansion Corp",
            accountNumber: "BEC-1001",
            status: "Active"
        });
        console.log(`✅ Customer Created: ${customer.id}\n`);

        // 2. Test Multi-Installment Payment Schedules
        console.log("💳 Testing Multi-Installment Payment Schedules (50/50 30/60 Days)...");
        const invoice = await arService.createInvoice({
            customerId: customer.id,
            invoiceNumber: `INV-MULTI-${Date.now()}`,
            amount: "1000.00",
            totalAmount: "1000.00",
            currency: "USD",
            status: "Draft",
            description: "Software License + Services",
            transactionClass: "INV",
            paymentTerms: "50/50 30/60 Days" // The trigger
        });
        console.log(`✅ Invoice Created: ${invoice.id}`);

        const schedules = await arService.getPaymentSchedules(invoice.id);
        console.log(`✅ Schedules Generated: ${schedules.length}`);

        if (schedules.length !== 2) {
            throw new Error(`Expected 2 schedules, got ${schedules.length}`);
        }
        console.log(`   - Installment 1: $${schedules[0].amountDue} due on ${schedules[0].dueDate}`);
        console.log(`   - Installment 2: $${schedules[1].amountDue} due on ${schedules[1].dueDate}\n`);


        // 3. Test Recurring Invoices
        console.log("🔁 Testing Recurring Invoices (Monthly)...");
        const recurring = await db.insert(arRecurringInvoices).values({
            customerId: customer.id,
            templateName: "Monthly Hosting Subscription",
            templateAmount: "250.00",
            templateCurrency: "USD",
            frequency: "Monthly",
            startDate: new Date(),
            nextRunDate: new Date(), // Set to today to trigger immediate run
            status: "Active"
        }).returning();

        console.log(`✅ Recurring Template Created: ${recurring[0].templateName}`);

        console.log("   - Running Recurring Processor...");
        const recurResult = await arService.processRecurringInvoices();
        console.log(`✅ Processed: ${recurResult.processed}, Errors: ${recurResult.errors}`);

        if (recurResult.processed < 1) {
            throw new Error("Failed to process the recurring invoice.");
        }

        const updatedRecur = await db.select().from(arRecurringInvoices).where(eq(arRecurringInvoices.id, recurring[0].id));
        console.log(`✅ Next Run Date advanced to: ${updatedRecur[0].nextRunDate}\n`);

        // 4. Test Balance Forward Statements
        console.log("📋 Testing Balance Forward Statements...");
        const statement = await arService.generateBalanceForwardStatements(customer.id, "Monthly");

        if (!statement) {
            throw new Error("Statement generation returned null.");
        }

        console.log(`✅ Statement Generated: ID ${statement.id}`);
        console.log(`   - Total Due: $${statement.totalDue}`);
        console.log(`   - Current Period: $${statement.currentPeriodAmount}`);
        console.log(`   - Balance Forward: $${statement.balanceForwardAmount}\n`);


        console.log("==========================================");
        console.log("🎉 ALL Billing Expansion Tests Passed!");
        console.log("==========================================");

    } catch (err: any) {
        console.error("\n❌ TEST FAILED:", err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

main();

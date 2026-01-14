import { db } from "../server/db";
import { billingEvents, billingBatches } from "@shared/schema/billing_enterprise";
import { arInvoices } from "@shared/schema/ar";
import { billingService } from "../server/modules/billing/BillingService";
import { eq, sql } from "drizzle-orm";

async function verifyEnterpriseBilling() {
    console.log("🚀 Starting Enterprise Billing Verification...");

    // 0. Ensure Schema Exists (Safe DDL)
    console.log("0. Setting up Database Schema...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS billing_rules (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar NOT NULL,
            description text,
            rule_type varchar NOT NULL,
            frequency varchar,
            milestone_percentage numeric,
            usage_unit varchar,
            is_active boolean DEFAULT true,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS billing_profiles (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id varchar NOT NULL,
            default_rule_id varchar,
            tax_exempt boolean DEFAULT false,
            tax_exemption_number varchar,
            currency varchar DEFAULT 'USD',
            payment_terms varchar DEFAULT 'Net 30',
            auto_invoice_enabled boolean DEFAULT true,
            email_invoices boolean DEFAULT true,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS billing_batches (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            run_date timestamp DEFAULT now(),
            status varchar DEFAULT 'Processing',
            total_events_processed integer DEFAULT 0,
            total_invoices_created integer DEFAULT 0,
            total_errors integer DEFAULT 0,
            error_message text,
            created_by varchar,
            created_at timestamp DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS billing_events (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            source_system varchar NOT NULL,
            source_transaction_id varchar NOT NULL,
            customer_id varchar NOT NULL,
            event_date timestamp NOT NULL,
            amount numeric(18, 2) NOT NULL,
            currency varchar DEFAULT 'USD',
            description text NOT NULL,
            quantity numeric DEFAULT 1,
            unit_price numeric(18, 2),
            status varchar DEFAULT 'Pending',
            batch_id varchar,
            invoice_id varchar,
            error_code varchar,
            error_message text,
            rule_id varchar,
            tax_code varchar,
            gl_account varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS ar_invoice_lines (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            invoice_id varchar NOT NULL,
            line_number integer NOT NULL,
            description text NOT NULL,
            quantity numeric DEFAULT 1,
            unit_price numeric(18, 2) DEFAULT 0,
            amount numeric(18, 2) NOT NULL,
            tax_amount numeric(18, 2) DEFAULT 0,
            tax_code varchar,
            gl_account varchar,
            billing_event_id varchar,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("✅ Schema setup complete.");

    const testCustomerId = "cus_test_123"; // Mock ID, ensure logic doesn't crash on FK if no DB check
    // Ideally we should create a customer first, but BillingService V1 implementation uses raw insert with ID.

    // 1. Create a Billing Event
    console.log("1. Creating Billing Event...");
    const event = await billingService.processEvent({
        sourceSystem: "Projects",
        sourceTransactionId: "TASK-101",
        customerId: testCustomerId,
        eventDate: new Date(),
        amount: "1500.00",
        description: "Development Services - Milestone 1",
        quantity: "1",
        unitPrice: "1500.00",
        status: "Pending"
    });
    console.log(`✅ Event Created: ${event.id} | Status: ${event.status}`);

    // 2. Run Auto-Invoice
    console.log("2. Running Auto-Invoice...");
    const batchResult = await billingService.runAutoInvoice("AdminUser");
    console.log(`✅ Batch Completed: ${batchResult.batchId} | Invoices Created: ${batchResult.count}`);

    if (batchResult.count === 0) {
        console.error("❌ Auto-Invoice failed to create invoice!");
        process.exit(1);
    }

    // 3. Verify Invoice
    const invoiceId = batchResult.invoiceIds[0];
    const invoices = await db.select().from(arInvoices).where(eq(arInvoices.id, invoiceId));

    if (invoices.length === 0) {
        console.error("❌ Invoice record not found in DB!");
        process.exit(1);
    }

    const invoice = invoices[0];
    console.log(`✅ Invoice Verified: ${invoice.invoiceNumber} | Amount: ${invoice.amount}`);

    if (Number(invoice.amount) !== 1500.00) {
        console.error(`❌ Amount Mismatch! Expected 1500.00, got ${invoice.amount}`);
        process.exit(1);
    }

    // 4. Verify Event Status
    const updatedCalls = await db.select().from(billingEvents).where(eq(billingEvents.id, event.id));
    const updatedEvent = updatedCalls[0];
    console.log(`✅ Event Status Updated: ${updatedEvent.status} | InvoiceID: ${updatedEvent.invoiceId}`);

    if (updatedEvent.status !== "Invoiced") {
        console.error("❌ Event status not updated to Invoiced!");
        process.exit(1);
    }

    console.log("🎉 Verification Successful!");
    process.exit(0);
}

verifyEnterpriseBilling().catch(console.error);

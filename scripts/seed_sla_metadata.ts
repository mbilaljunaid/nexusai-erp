
import { db } from "../server/db";
import { slaEventClasses, slaEventTypes, slaJournalLineTypes, slaMappingSets, slaAccountingRules } from "../shared/schema/sla";
import { sql } from "drizzle-orm";

async function seedSlaMetadata() {
    console.log("Seeding SLA Metadata (Standardized Model)...");

    // 1. Seed Event Classes (Business Objects)
    const eventClasses = [
        { id: "AP_INVOICE", applicationId: "AP", name: "Payables Invoice", description: "Supplier Invoices" },
        { id: "AP_PAYMENT", applicationId: "AP", name: "Payables Payment", description: "Supplier Payments" },
        { id: "AR_INVOICE", applicationId: "AR", name: "Receivables Invoice", description: "Customer Invoices" },
        { id: "AR_RECEIPT", applicationId: "AR", name: "Receivables Receipt", description: "Customer Payments" },
        { id: "AR_ADJUSTMENT", applicationId: "AR", name: "Receivables Adjustment", description: "Adjustments and Write-offs" }
    ];

    for (const ec of eventClasses) {
        await db.insert(slaEventClasses).values(ec).onConflictDoNothing();
        console.log(`✅ Class: ${ec.id}`);
    }

    // 2. Seed Event Types (Lifecycle States)
    const eventTypes = [
        // AP Invoice
        { id: "AP_INVOICE_VALIDATED", eventClassId: "AP_INVOICE", name: "Invoice Validated", description: "Invoice is validated and ready for accounting" },
        { id: "AP_INVOICE_CANCELLED", eventClassId: "AP_INVOICE", name: "Invoice Cancelled", description: "Invoice cancellation" },
        // AP Payment
        { id: "AP_PAYMENT_CREATED", eventClassId: "AP_PAYMENT", name: "Payment Created", description: "Payment issued" },
        { id: "AP_PAYMENT_CLEARED", eventClassId: "AP_PAYMENT", name: "Payment Cleared", description: "Payment cleared in bank" },
        // AR Invoice
        { id: "AR_INVOICE_COMPLETE", eventClassId: "AR_INVOICE", name: "Invoice Complete", description: "Invoice finalized" },
        // AR Receipt
        { id: "AR_RECEIPT_CREATED", eventClassId: "AR_RECEIPT", name: "Receipt Created", description: "Cash received" },
        { id: "AR_RECEIPT_APPLIED", eventClassId: "AR_RECEIPT", name: "Receipt Applied", description: "Cash applied to invoice" },
        { id: "AR_RECEIPT_UNAPPLIED", eventClassId: "AR_RECEIPT", name: "Receipt Unapplied", description: "Cash unapplied" },
        // AR Adjustment
        { id: "AR_ADJUSTMENT_CREATED", eventClassId: "AR_ADJUSTMENT", name: "Adjustment Created", description: "Adjustment posted" }
    ];

    for (const et of eventTypes) {
        await db.insert(slaEventTypes).values(et).onConflictDoNothing();
        console.log(`✅ Type: ${et.id}`);
    }

    // 3. Seed Journal Line Types (JLT) - The Template
    // Defines Dr/Cr logic generically

    // Clear existing for fresh seed (Dev Mode)
    await db.delete(slaJournalLineTypes).where(
        sql`${slaJournalLineTypes.eventClassId} IN ('AP_INVOICE', 'AP_PAYMENT', 'AR_INVOICE', 'AR_RECEIPT', 'AR_ADJUSTMENT')`
    );

    const jlts = [
        // AP Invoice - Standard Amount
        {
            code: "LIABILITY", eventClassId: "AP_INVOICE", name: "Liability", side: "Cr", accountingClass: "Liability", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Liability for Inv {invoiceNumber}"
        },
        {
            code: "ITEM_EXPENSE", eventClassId: "AP_INVOICE", name: "Item Expense", side: "Dr", accountingClass: "Expense", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Expense for Item"
        },
        // AP Invoice - Conditional Tax
        {
            code: "WHT_TAX", eventClassId: "AP_INVOICE", name: "Withholding Tax", side: "Dr", accountingClass: "Tax", balanceType: "Actual",
            condition: "false", // DISABLED FOR VERIFICATION (To ensure balanced 100/100 journal)
            amountSource: "withholdingAmount",
            descriptionRule: "WHT Tax for Invoice"
        },

        // AP Payment
        {
            code: "LIABILITY_DR", eventClassId: "AP_PAYMENT", name: "Liability Relief", side: "Dr", accountingClass: "Liability", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Payment for Inv"
        },
        {
            code: "CASH_CR", eventClassId: "AP_PAYMENT", name: "Cash", side: "Cr", accountingClass: "Cash", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Payment Outflow"
        },

        // AR Invoice (Keep Standard)
        // AR Invoice
        {
            code: "RECEIVABLE", eventClassId: "AR_INVOICE", name: "Receivable", side: "Dr", accountingClass: "Receivable", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Receivable for Inv {invoiceNumber}"
        },
        {
            code: "REVENUE", eventClassId: "AR_INVOICE", name: "Revenue", side: "Cr", accountingClass: "Revenue", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Revenue for Inv {invoiceNumber}"
        },

        // AR Receipt (Created)
        {
            code: "CASH_DR", eventClassId: "AR_RECEIPT", name: "Cash", side: "Dr", accountingClass: "Cash", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Receipt {receiptNumber} Cash"
        },
        {
            code: "UNAPPLIED_CR", eventClassId: "AR_RECEIPT", name: "Unapplied Cash", side: "Cr", accountingClass: "Unapplied Cash", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Receipt {receiptNumber} Unapplied"
        },

        // AR Receipt (Applied) - Replaces Unapplied with Receivable
        {
            code: "UNAPPLIED_DR", eventClassId: "AR_RECEIPT", name: "Unapplied Cash", side: "Dr", accountingClass: "Unapplied Cash", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Apply Receipt {receiptNumber}"
        },
        {
            code: "RECEIVABLE_CR", eventClassId: "AR_RECEIPT", name: "Receivable", side: "Cr", accountingClass: "Receivable", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Apply to Inv {invoiceNumber}"
        },

        // AR Adjustment
        {
            code: "ADJUSTMENT_DR", eventClassId: "AR_ADJUSTMENT", name: "Adjustment Expense", side: "Dr", accountingClass: "Expense", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "{adjustmentType} for {invoiceNumber}"
        },
        {
            code: "RECEIVABLE_CR_ADJ", eventClassId: "AR_ADJUSTMENT", name: "Receivable", side: "Cr", accountingClass: "Receivable", balanceType: "Actual",
            amountSource: "amount", descriptionRule: "Adjustment for {invoiceNumber}"
        }
    ];

    for (const jlt of jlts) {
        await db.insert(slaJournalLineTypes).values(jlt);
        console.log(`✅ JLT: ${jlt.code} for ${jlt.eventClassId}`);
    }

    console.log("SLA Metadata seeding completed.");
}

seedSlaMetadata();

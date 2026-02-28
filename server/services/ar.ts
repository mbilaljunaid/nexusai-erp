import { storage } from "../storage";
import {
    InsertArCustomer,
    ArCustomer,
    InsertArCustomerAccount,
    ArCustomerAccount,
    InsertArCustomerSite,
    ArCustomerSite,
    InsertArInvoice,
    ArInvoice,
    ArInvoiceLine,
    InsertArInvoiceLine,
    ArReceipt,
    InsertArReceipt,
    InsertArReceiptApplication,
    ArReceiptApplication,
    InsertArRevenueRule,
    ArRevenueRule,
    InsertArRevenueSchedule,
    ArRevenueSchedule,
    InsertArDunningTemplate,
    ArDunningTemplate,
    InsertArDunningRun,
    ArDunningRun,
    InsertArCollectorTask,
    ArCollectorTask,
    InsertArAdjustment,
    ArAdjustment,
    InsertArSystemOptions,
    ArSystemOptions,
    arReceiptApplications,
    InsertArTransactionType,
    ArTransactionType,
    InsertArBatchSource,
    ArBatchSource,
    InsertArReceiptMethod,
    ArReceiptMethod,
    InsertArAutoAccountingRule,
    ArAutoAccountingRule,
    InsertArCustomerProfile,
    ArCustomerProfile,
    InsertArCustomerBankAccount,
    ArCustomerBankAccount
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { financeService } from "./finance";
import { db } from "../db";
import { glLedgers } from "@shared/schema";
import { DunningWorker } from "../worker/DunningWorker";
import { arAiService } from "./ar-ai";
import { slaEngine } from "../modules/sla/sla.service";


export class ArService {
    // Customers (Party Level)
    async listCustomers(): Promise<ArCustomer[]> {
        return await storage.listArCustomers();
    }

    async createCustomer(data: InsertArCustomer): Promise<ArCustomer> {
        return await storage.createArCustomer(data);
    }

    async getCustomer(id: string): Promise<ArCustomer | undefined> {
        return await storage.getArCustomer(id);
    }

    async updateCustomer(id: string, data: Partial<InsertArCustomer>): Promise<ArCustomer | undefined> {
        return await storage.updateArCustomer(id, data);
    }

    // TCA Depth: Customer Profiles
    async listCustomerProfiles(): Promise<ArCustomerProfile[]> {
        return await storage.listArCustomerProfiles();
    }
    async getCustomerProfile(id: string): Promise<ArCustomerProfile | undefined> {
        return await storage.getArCustomerProfile(id);
    }
    async createCustomerProfile(data: InsertArCustomerProfile): Promise<ArCustomerProfile> {
        return await storage.createArCustomerProfile(data);
    }

    // TCA Depth: Customer Bank Accounts
    async listCustomerBankAccounts(customerId?: string): Promise<ArCustomerBankAccount[]> {
        return await storage.listArCustomerBankAccounts(customerId);
    }
    async getCustomerBankAccount(id: string): Promise<ArCustomerBankAccount | undefined> {
        return await storage.getArCustomerBankAccount(id);
    }
    async createCustomerBankAccount(data: InsertArCustomerBankAccount): Promise<ArCustomerBankAccount> {
        return await storage.createArCustomerBankAccount(data);
    }


    // Configuration Entities

    // Transaction Types
    async listTransactionTypes(): Promise<ArTransactionType[]> {
        return await storage.listArTransactionTypes();
    }
    async getTransactionType(id: string): Promise<ArTransactionType | undefined> {
        return await storage.getArTransactionType(id);
    }
    async createTransactionType(data: InsertArTransactionType): Promise<ArTransactionType> {
        return await storage.createArTransactionType(data);
    }

    // Batch Sources
    async listBatchSources(): Promise<ArBatchSource[]> {
        return await storage.listArBatchSources();
    }
    async getBatchSource(id: string): Promise<ArBatchSource | undefined> {
        return await storage.getArBatchSource(id);
    }
    async createBatchSource(data: InsertArBatchSource): Promise<ArBatchSource> {
        return await storage.createArBatchSource(data);
    }

    // Receipt Methods
    async listReceiptMethods(): Promise<ArReceiptMethod[]> {
        return await storage.listArReceiptMethods();
    }
    async getReceiptMethod(id: string): Promise<ArReceiptMethod | undefined> {
        return await storage.getArReceiptMethod(id);
    }
    async createReceiptMethod(data: InsertArReceiptMethod): Promise<ArReceiptMethod> {
        return await storage.createArReceiptMethod(data);
    }

    // AutoAccounting Rules
    async listAutoAccountingRules(): Promise<ArAutoAccountingRule[]> {
        return await storage.listArAutoAccountingRules();
    }
    async getAutoAccountingRule(id: string): Promise<ArAutoAccountingRule | undefined> {
        return await storage.getArAutoAccountingRule(id);
    }
    async createAutoAccountingRule(data: InsertArAutoAccountingRule): Promise<ArAutoAccountingRule> {
        return await storage.createArAutoAccountingRule(data);
    }

    /**
     * Advanced AutoAccounting Derivation Engine
     * Constructs a GL Account string (e.g., "01-100-4000-0000") by evaluating all active
     * AutoAccounting rules for a specific accountType (e.g., "Revenue", "Receivable").
     */
    async deriveAutoAccounting(
        accountType: string,
        context: {
            transactionTypeId?: string | null;
            salespersonId?: string | null;
            memoLineId?: string | null;
            standardLineAccountId?: string | null; // Account string from standard line
            transactionTypeAccountId?: string | null; // e.g., defaultRevenueAccount
            customerSiteAccountId?: string | null;
        }
    ): Promise<string> {
        const rules = await this.listAutoAccountingRules();

        // Filter rules by the target accountType (e.g., "Revenue")
        const activeRules = rules.filter(r => r.status === "Active" && r.accountType === accountType);

        if (activeRules.length === 0) {
            // Fallback to transaction type defaults if no rules found
            return context.transactionTypeAccountId || "00-000-0000-0000";
        }

        // Suppose typical GL string has 4 segments for this ERP context: Company-Department-Account-SubAccount
        // In a real system the segment structure is obtained from `glCoaStructures`.
        // We will mock the derivation of a 4-segment string based on exact segment names or index.
        const segmentNames = ["Company", "Department", "Account", "SubAccount"];
        const derivedSegments: string[] = ["00", "000", "0000", "0000"];

        for (let i = 0; i < segmentNames.length; i++) {
            const segName = segmentNames[i];
            const rule = activeRules.find(r => r.segmentName === segName);

            if (rule) {
                switch (rule.sourceType) {
                    case "Constant":
                        derivedSegments[i] = rule.constantValue || derivedSegments[i];
                        break;
                    case "Transaction Type":
                        // Extract the i-th segment from the default strings
                        if (context.transactionTypeAccountId) {
                            const parts = context.transactionTypeAccountId.split("-");
                            if (parts.length > i) derivedSegments[i] = parts[i];
                        }
                        break;
                    case "Standard Line":
                        if (context.standardLineAccountId) {
                            const parts = context.standardLineAccountId.split("-");
                            if (parts.length > i) derivedSegments[i] = parts[i];
                        }
                        break;
                    case "Customer Site":
                        if (context.customerSiteAccountId) {
                            const parts = context.customerSiteAccountId.split("-");
                            if (parts.length > i) derivedSegments[i] = parts[i];
                        }
                        break;
                    // Additional sources like Salesperson, Taxes go here
                }
            }
        }

        return derivedSegments.join("-");
    }

    // System Options
    async getSystemOptions(ledgerId: string): Promise<ArSystemOptions | undefined> {
        return await storage.getArSystemOptions(ledgerId);
    }

    async upsertSystemOptions(data: InsertArSystemOptions): Promise<ArSystemOptions> {
        return await storage.upsertArSystemOptions(data);
    }

    // Accounts
    async listAccounts(customerId?: string): Promise<ArCustomerAccount[]> {
        return await storage.listArCustomerAccounts(customerId);
    }

    async createAccount(data: InsertArCustomerAccount): Promise<ArCustomerAccount> {
        return await storage.createArCustomerAccount(data);
    }

    async getAccount(id: string): Promise<ArCustomerAccount | undefined> {
        return await storage.getArCustomerAccount(id);
    }

    // Sites
    async listSites(accountId: string): Promise<ArCustomerSite[]> {
        return await storage.listArCustomerSites(accountId);
    }

    async createSite(data: InsertArCustomerSite): Promise<ArCustomerSite> {
        return await storage.createArCustomerSite(data);
    }

    async getSite(id: string): Promise<ArCustomerSite | undefined> {
        return await storage.getArCustomerSite(id);
    }

    // Contacts
    async listContacts(customerId: string): Promise<ArCustomerContact[]> {
        return await storage.listArCustomerContacts(customerId);
    }

    async createContact(data: InsertArCustomerContact): Promise<ArCustomerContact> {
        return await storage.createArCustomerContact(data);
    }

    async getContact(id: string): Promise<ArCustomerContact | undefined> {
        return await storage.getArCustomerContact(id);
    }

    async updateContact(id: string, data: Partial<InsertArCustomerContact>): Promise<ArCustomerContact | undefined> {
        return await storage.updateArCustomerContact(id, data);
    }

    async deleteContact(id: string): Promise<boolean> {
        return await storage.deleteArCustomerContact(id);
    }

    // ==========================================
    // PHASE 2 & ADVANCED AR BILLING SCHEMA
    // ==========================================

    // AutoInvoice Staging
    async listAutoInvoiceStaging(status?: string): Promise<ArAutoInvoiceStaging[]> {
        return await storage.listArAutoInvoiceStaging(status);
    }

    async getAutoInvoiceStaging(id: string): Promise<ArAutoInvoiceStaging | undefined> {
        return await storage.getArAutoInvoiceStaging(id);
    }

    async createAutoInvoiceStaging(data: InsertArAutoInvoiceStaging): Promise<ArAutoInvoiceStaging> {
        return await storage.createArAutoInvoiceStaging(data);
    }

    async updateAutoInvoiceStaging(id: string, data: Partial<InsertArAutoInvoiceStaging>): Promise<ArAutoInvoiceStaging | undefined> {
        return await storage.updateArAutoInvoiceStaging(id, data);
    }

    async deleteAutoInvoiceStaging(id: string): Promise<boolean> {
        return await storage.deleteArAutoInvoiceStaging(id);
    }

    // AutoInvoice Errors
    async listAutoInvoiceErrors(stagingId: string): Promise<ArAutoInvoiceError[]> {
        return await storage.listArAutoInvoiceErrors(stagingId);
    }

    async createAutoInvoiceError(data: InsertArAutoInvoiceError): Promise<ArAutoInvoiceError> {
        return await storage.createArAutoInvoiceError(data);
    }

    async deleteAutoInvoiceErrors(stagingId: string): Promise<boolean> {
        return await storage.deleteArAutoInvoiceErrors(stagingId);
    }

    // Sales Credits
    async listSalesCredits(invoiceLineId: string): Promise<ArSalesCredit[]> {
        return await storage.listArSalesCredits(invoiceLineId);
    }

    async createSalesCredit(data: InsertArSalesCredit): Promise<ArSalesCredit> {
        return await storage.createArSalesCredit(data);
    }

    async updateSalesCredit(id: string, data: Partial<InsertArSalesCredit>): Promise<ArSalesCredit | undefined> {
        return await storage.updateArSalesCredit(id, data);
    }

    async deleteSalesCredit(id: string): Promise<boolean> {
        return await storage.deleteArSalesCredit(id);
    }

    // AutoInvoice Import Batch Logic
    async importAutoInvoiceBatch(): Promise<{ processed: number; errors: number }> {
        // Fetch all lines in "NEW" or "ERROR" status
        const stagingLines = await storage.listArAutoInvoiceStaging();
        const pendingLines = stagingLines.filter(line => line.status === 'NEW' || line.status === 'ERROR');

        let processedCount = 0;
        let errorCount = 0;

        // In a real Oracle Parity system, this handles Grouping Rules (into Headers) based on specific attributes.
        // Simplified Grouping: Create 1 Invoice per Staging Line for this implementation
        for (const line of pendingLines) {
            // Clear previous errors for this line
            await storage.deleteArAutoInvoiceErrors(line.id);

            const errors: string[] = [];

            // 1. Validation Logic
            const customer = await storage.getArCustomer(line.customerId);
            if (!customer) errors.push(`Customer ID ${line.customerId} is invalid or missing.`);

            const txType = await storage.getArTransactionType(line.transactionTypeId);
            if (!txType) errors.push(`Transaction Type ID ${line.transactionTypeId} is invalid or missing.`);

            const batchSource = await storage.getArBatchSource(line.batchSourceId);
            if (!batchSource) errors.push(`Batch Source ID ${line.batchSourceId} is invalid or missing.`);

            if (Number(line.amount) <= 0) errors.push(`Line amount must be greater than 0.`);

            // 2. Action based on Validation
            if (errors.length > 0) {
                errorCount++;
                // Log Errors
                for (const err of errors) {
                    await storage.createArAutoInvoiceError({ stagingId: line.id, errorMessage: err, invalidValue: "MULTIPLE" });
                }
                // Mark Staging Line as Error
                await storage.updateArAutoInvoiceStaging(line.id, { status: 'ERROR', processDate: new Date() });
            } else {
                try {
                    // Create the Invoice Header
                    const invoice = await this.createInvoice({
                        businessUnitId: customer?.businessUnitId || "1",
                        customerId: line.customerId,
                        accountId: null, // Depending on grouping rules, might be derived
                        siteId: null, // Usually derived from AutoInvoice grouping attributes
                        invoiceNumber: `AUTOINV-${line.id.substring(0, 8).toUpperCase()}`,
                        amount: line.amount,
                        taxAmount: "0.00", // Would be computed normally
                        totalAmount: line.amount,
                        currency: line.currency || "USD",
                        transactionTypeId: line.transactionTypeId,
                        batchSourceId: line.batchSourceId,
                        description: line.description,
                        status: "Draft",
                        glDate: new Date(),
                        glStatus: "Unprocessed",
                        transactionClass: "INV"
                    });

                    // Create the Invoice Line
                    await this.createInvoiceLine({
                        invoiceId: invoice.id,
                        lineNumber: 1,
                        lineType: line.lineType || "LINE",
                        description: line.description,
                        amount: line.amount,
                        quantity: "1",
                        unitPrice: line.amount
                    });

                    // Mark Staging Line as Processed
                    await storage.updateArAutoInvoiceStaging(line.id, { status: 'PROCESSED', processDate: new Date() });
                    processedCount++;
                } catch (e: any) {
                    errorCount++;
                    await storage.createArAutoInvoiceError({ stagingId: line.id, errorMessage: `System error creating invoice: ${e.message}`, invalidValue: "SYSTEM" });
                    await storage.updateArAutoInvoiceStaging(line.id, { status: 'ERROR', processDate: new Date() });
                }
            }
        }

        return { processed: processedCount, errors: errorCount };
    }

    // Invoices
    async listInvoices(limit?: number, offset?: number): Promise<ArInvoice[]> {
        return await storage.listArInvoices(limit, offset);
    }

    async getInvoicesCount(): Promise<number> {
        return await storage.getArInvoicesCount();
    }

    async createInvoice(data: InsertArInvoice): Promise<ArInvoice> {
        // 1. Credit Check Enforce
        if (data.accountId) {
            const account = await storage.getArCustomerAccount(data.accountId);
            if (account) {
                if (account.creditHold) {
                    throw new Error(`Credit Check Failed: Account ${account.accountNumber} is on Credit Hold.`);
                }

                // Calculate outstanding balance + new amount
                // Note: Account.balance might be stale, best to recalc
                const { outstanding } = await this.getAccountBalance(account.id);
                const newTotal = outstanding + Number(data.totalAmount);

                if (Number(account.creditLimit) > 0 && newTotal > Number(account.creditLimit)) {
                    throw new Error(`Credit Check Failed: Credit Limit Exceeded. Limit: ${account.creditLimit}, New Exposure: ${newTotal}`);
                }
            }
        }

        const invoice = await storage.createArInvoice(data);

        // 1b. Revenue Recognition Schedule Generation
        if (data.revenueRuleId) {
            const rule = await storage.getArRevenueRule(data.revenueRuleId);
            if (rule) {
                const schedules: InsertArRevenueSchedule[] = [];
                const totalAmount = Number(invoice.totalAmount);
                const periods = rule.durationPeriods || 1;
                const amountPerPeriod = totalAmount / periods;
                const startDate = new Date();

                for (let i = 0; i < periods; i++) {
                    const scheduleDate = new Date(startDate);
                    scheduleDate.setMonth(startDate.getMonth() + i);

                    schedules.push({
                        invoiceId: invoice.id,
                        scheduleDate: scheduleDate,
                        amount: String(amountPerPeriod.toFixed(2)),
                        periodName: `Period ${i + 1}`,
                        status: "Pending",
                        ruleId: rule.id,
                        accountClass: "Revenue"
                    });
                }
                await storage.createArRevenueSchedulesBulk(schedules);

                // Update invoice recognition status
                if (data.recognitionStatus !== "Deferred") {
                    await storage.updateArInvoice(invoice.id, { recognitionStatus: "Deferred" });
                    invoice.recognitionStatus = "Deferred"; // Update local object
                }
            }
        }

        // ... SLA Logic

        // 2. Trigger SLA Accounting
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            let eventClass = "AR_INVOICE"; // Standardized Event Class ID
            // if (invoice.transactionClass === "CM") eventClass = "AR_CREDIT_MEMO"; // TODO: Define CM/DM JLTs later

            await slaEngine.createAccounting({
                eventClassId: eventClass,
                eventTypeId: "AR_INVOICE_COMPLETE",
                entityId: invoice.id,
                entityTable: "ar_invoices",
                description: `${invoice.transactionClass} transaction: ${invoice.invoiceNumber}`,
                amount: Number(invoice.totalAmount),
                currencyCode: invoice.currency || "USD",
                eventDate: new Date(), // Use invoice.date ideally
                glDate: new Date(),
                ledgerId,
                sourceData: {
                    invoiceNumber: invoice.invoiceNumber,
                    customerId: invoice.customerId,
                    accountId: invoice.accountId,
                    class: invoice.transactionClass,
                    revenueRuleId: invoice.revenueRuleId,
                    amount: invoice.totalAmount
                }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for transaction:", err);
        }

        return invoice;
    }

    async createInvoiceLine(data: InsertArInvoiceLine): Promise<ArInvoiceLine> {
        const invoice = await storage.getArInvoice(data.invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        // 1. DYNAMIC CVR & AUTOACCOUNTING
        if (!data.ccid) {
            let accountClass: "Revenue" | "Receivable" | "Freight" | "Tax" = "Revenue";
            if (data.lineType === "TAX") accountClass = "Tax";
            if (data.lineType === "FREIGHT") accountClass = "Freight";

            data.ccid = await this.deriveAutoAccounting(invoice, accountClass);
        }

        // 2. CROSS-VALIDATION RULES (CVR) EVALUATION ON SAVE
        if (data.ccid) {
            try {
                const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
                const ledgerId = ledger?.id || "PRIMARY";

                // Fetch Rules
                const crossValidationRules = await storage.listCrossValidationRules(ledgerId);
                const segments = data.ccid.split("-");

                // Evaluate Each Rule
                for (const rule of crossValidationRules) {
                    if (!rule.isEnabled) continue;

                    // Simple parsing for "SegmentN=Value"
                    const evaluateFilter = (filter: string) => {
                        const match = filter.match(/Segment(\d+)=(.+)/i);
                        if (!match) return false;
                        const index = parseInt(match[1]) - 1;
                        const value = match[2].trim();
                        return segments[index] === value;
                    };

                    if (rule.conditionFilter && evaluateFilter(rule.conditionFilter)) {
                        if (rule.validationFilter && !evaluateFilter(rule.validationFilter)) {
                            // CVR Violated!
                            const message = rule.errorMessage || `Cross-Validation Failed: ${rule.name}`;
                            if (rule.errorAction === "Error") throw new Error(message);
                            else console.warn(`[AR] CVR Warning: ${message}`);
                        }
                    }
                }
            } catch (err: any) {
                console.error("[AR] CVR validation failed:", err);
                // Propagate Error up to block save
                if (err.message.includes("Cross-Validation")) throw err;
            }
        }

        return await storage.createArInvoiceLine(data);
    }

    async listInvoiceLines(invoiceId: string): Promise<ArInvoiceLine[]> {
        return await storage.listArInvoiceLines(invoiceId);
    }

    async createCreditMemo(sourceInvoiceId: string, amount: number, reason: string): Promise<ArInvoice> {
        const source = await storage.getArInvoice(sourceInvoiceId);
        if (!source) throw new Error("Source invoice not found");

        const cmData: InsertArInvoice = {
            customerId: source.customerId,
            accountId: source.accountId,
            siteId: source.siteId,
            invoiceNumber: `CM-${source.invoiceNumber}-${Date.now().toString().slice(-4)}`,
            amount: String(amount),
            taxAmount: "0",
            totalAmount: String(amount),
            currency: source.currency || "USD",
            dueDate: new Date(),
            status: "Sent",
            description: `Credit Memo for ${source.invoiceNumber}. Reason: ${reason}`,
            transactionClass: "CM",
            sourceTransactionId: source.id
        };

        return await this.createInvoice(cmData);
    }

    async createDebitMemo(accountId: string, siteId: string, amount: number, description: string): Promise<ArInvoice> {
        const account = await storage.getArCustomerAccount(accountId);
        if (!account) throw new Error("Account not found");

        const dmData: InsertArInvoice = {
            customerId: account.customerId,
            accountId: account.id,
            siteId: siteId,
            invoiceNumber: `DM-${Date.now().toString().slice(-6)}`,
            amount: String(amount),
            taxAmount: "0",
            totalAmount: String(amount),
            currency: "USD",
            dueDate: new Date(),
            status: "Sent",
            description: description,
            transactionClass: "DM"
        };

        return await this.createInvoice(dmData);
    }

    async createChargeback(receiptId: string, invoiceId: string, amount: number): Promise<ArInvoice> {
        const invoice = await storage.getArInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        const cbData: InsertArInvoice = {
            customerId: invoice.customerId,
            accountId: invoice.accountId,
            siteId: invoice.siteId,
            invoiceNumber: `CB-${invoice.invoiceNumber}-${Date.now().toString().slice(-4)}`,
            amount: String(amount),
            taxAmount: "0",
            totalAmount: String(amount),
            currency: invoice.currency || "USD",
            dueDate: new Date(),
            status: "Sent",
            description: `Chargeback from Receipt ${receiptId.slice(0, 8)} on Invoice ${invoice.invoiceNumber}`,
            transactionClass: "CB",
            sourceTransactionId: invoice.id
        };

        return await this.createInvoice(cbData);
    }

    async applyCreditMemo(cmId: string, invoiceId: string, amount: number): Promise<void> {
        const cm = await storage.getArInvoice(cmId);
        if (!cm || cm.transactionClass !== "CM") throw new Error("Invalid Credit Memo");

        const invoice = await storage.getArInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        // Create adjustment on the Invoice to reduce its balance
        await this.createAdjustment({
            invoiceId: invoiceId,
            adjustmentType: "Credit Memo Application",
            amount: String(-amount), // Negative to reduce balance
            reason: `Applied CM ${cm.invoiceNumber}`,
            status: "Approved",
            glAccountId: "2220", // Placeholder Suspense/Clearing
            createdBy: "SYSTEM"
        });

        // Mark CM as processed (Simplified: Assuming full application for now)
        // In a full system, we'd create a counter-adjustment or linking record.
        await storage.updateArInvoiceStatus(cmId, "Paid");

        // Trigger SLA
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            await slaEngine.createAccounting({
                eventClassId: "AR_CM_APP",
                eventTypeId: "AR_CM_APPLY_STD",
                entityId: cm.id,
                entityTable: "ar_invoices",
                description: `Applied CM ${cm.invoiceNumber} to ${invoice.invoiceNumber}`,
                amount: amount,
                currencyCode: cm.currency || "USD",
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: { cmId, invoiceId }
            });
        } catch (e) {
            console.error("SLA Error CM Application", e);
        }
    }

    async getInvoice(id: string): Promise<ArInvoice | undefined> {
        return await storage.getArInvoice(id);
    }

    // Receipts
    async listReceipts(): Promise<ArReceipt[]> {
        return await storage.listArReceipts();
    }

    async createReceipt(data: InsertArReceipt): Promise<ArReceipt> {
        // Handle explicit statuses or derive them
        let status = data.status || "Unapplied";
        if (data.invoiceId) {
            status = "Applied";
        } else if (!data.customerId) {
            status = "Unidentified";
        }

        // Initialize unappliedAmount to total amount if not set
        const receiptData = {
            ...data,
            unappliedAmount: data.unappliedAmount || data.amount,
            status: status
        };
        const receipt = await storage.createArReceipt(receiptData);

        // If receipt is applied to an invoice, update invoice status and create application record
        if (receipt.invoiceId) {
            await this.applyReceipt(receipt.id, receipt.invoiceId, Number(receipt.amount));
        }

        // 2. Trigger SLA Accounting (for the receipt creation itself - Cash DR, Unapplied/Unidentified CR)
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            // If cross-currency, SLA needs the accounted amount
            const exchangeRate = Number(receipt.exchangeRate) || 1;
            const accountedAmount = Number(receipt.amount) * exchangeRate;

            await slaEngine.createAccounting({
                eventClassId: "AR_RECEIPT",
                eventTypeId: "AR_RECEIPT_CREATED",
                entityId: receipt.id,
                entityTable: "ar_receipts",
                description: `Customer Receipt: ${receipt.id.slice(0, 8)} - ${status}`,
                amount: accountedAmount, // Ensure SLA gets the base currency amount
                currencyCode: ledger?.currency || "USD", // SLA entries are in ledger currency usually unless multi-curr SLA is implemented fully
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: {
                    receiptNumber: receipt.id.slice(0, 8), // or real number field
                    accountId: receipt.accountId,
                    customerId: receipt.customerId,
                    amount: receipt.amount,
                    currency: receipt.currency,
                    exchangeRate
                }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for receipt creation:", err);
        }

        return receipt;
    }

    async applyReceipt(receiptId: string, invoiceId: string, amount: number): Promise<ArReceiptApplication> {
        const receipt = await storage.getArReceipt(receiptId);
        if (!receipt) throw new Error("Receipt not found");

        const invoice = await storage.getArInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        // 1. Cross-Currency Calculation (Simplified)
        let allocatedReceiptAmount = amount; // Assume same currency by default
        let fxGainLoss = 0;

        if (receipt.currency !== invoice.currency) {
            // In a real system, you'd lookup daily rates if not provided on the receipt
            // Here we use the exchange rate stamped on the receipt as a proxy,
            // or just a mock calculation for parity demonstration
            const receiptRate = Number(receipt.exchangeRate) || 1.0;
            // Assume invoice is in USD (1.0) and receipt is in EUR (1.1)
            // Amount applied is in INVOICE currency (USD).
            // We need to know how much of the RECEIPT currency (EUR) that consumed.
            allocatedReceiptAmount = amount / receiptRate;

            // Very simplified FX Gain/Loss (just an illustration, real math requires inverse/direct rate understanding)
            // If they paid less EUR to clear the USD invoice than expected = Gain
            fxGainLoss = (amount * 1.0) - (allocatedReceiptAmount * receiptRate);
        }

        if (Number(receipt.unappliedAmount) < allocatedReceiptAmount) {
            throw new Error(`Insufficient unapplied amount on receipt. Available: ${receipt.unappliedAmount}, Required: ${allocatedReceiptAmount}`);
        }

        // 2. Create Application Record
        const application = await storage.createArReceiptApplication({
            receiptId,
            invoiceId,
            amountApplied: String(amount),
            allocatedReceiptAmount: String(allocatedReceiptAmount),
            fxGainLoss: String(fxGainLoss),
            status: "Applied",
        });

        // 3. Update Receipt Unapplied Balance
        // We deduct the allocatedReceiptAmount (in receipt currency) from the unapplied pool
        let newUnapplied = Number(receipt.unappliedAmount) - allocatedReceiptAmount;
        let pStatus = newUnapplied <= 0 ? "Applied" : "Unapplied";

        // Advanced Cash App: Automatic Write-Off for small remaining unapplied amounts (e.g., < $1.00)
        // In a real system, this threshold is controlled by System Options / Receipt Method limits.
        const WRITE_OFF_THRESHOLD = 1.00;
        if (newUnapplied > 0 && newUnapplied <= WRITE_OFF_THRESHOLD) {
            // Create a small adjustment to clear the invoice balance if needed, or just write off the receipt
            // Since this is receipt write-off, we typically create an adjustment on the applied invoice,
            // or a dedicated Miscellaneous Receipt line. Let's do an Invoice Adjustment to close it.
            try {
                await this.createAdjustment({
                    invoiceId: invoiceId,
                    adjustmentType: "WriteOff",
                    amount: String(-newUnapplied), // Credit adjustment to close invoice if it was under-paid
                    reason: `Auto Receipt Write-Off for ${receipt.id.slice(0, 8)}`,
                    status: "Approved",
                    glAccountId: "Auto-Write-Off-Account", // Should come from System Options
                    createdBy: "SYSTEM"
                });

                // Ensure we also consume the rest of the receipt so it doesn't hover unapplied
                await storage.createArReceiptApplication({
                    receiptId,
                    invoiceId,
                    amountApplied: String(newUnapplied * Number(receipt.exchangeRate || 1)), // Re-convert back to invoice curr if applying to invoice
                    allocatedReceiptAmount: String(newUnapplied),
                    status: "Applied",
                });

                newUnapplied = 0;
                pStatus = "Applied";
            } catch (woErr) {
                console.warn("[AR] Auto write-off failed, leaving unapplied balance", woErr);
            }
        }

        await storage.updateArReceipt(receiptId, {
            unappliedAmount: String(newUnapplied),
            status: pStatus
        });

        // 3. Update Invoice Status
        // Calculate total applied to this invoice
        const apps = await storage.listArReceiptApplications(undefined, invoiceId);
        const totalApplied = apps.reduce((sum, a) => sum + Number(a.amountApplied), 0);
        const newStatus = totalApplied >= Number(invoice.totalAmount) ? "Paid" : "PartiallyPaid";
        await storage.updateArInvoiceStatus(invoiceId, newStatus);

        // 4. Trigger SLA Accounting (Unapplied DR, Receivable CR)
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            await slaEngine.createAccounting({
                eventClassId: "AR_RECEIPT",
                eventTypeId: "AR_RECEIPT_APPLIED",
                entityId: application.id,
                entityTable: "ar_receipt_applications",
                description: `Receipt Application: ${amount} to ${invoice.invoiceNumber}`,
                amount: Number(amount),
                currencyCode: invoice.currency || "USD",
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: {
                    receiptNumber: receipt.id.slice(0, 8),
                    receiptId: receipt.id,
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    accountId: receipt.accountId,
                    amount: amount
                }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for receipt application:", err);
        }

        return application;
    }

    async unapplyReceipt(applicationId: string): Promise<void> {
        // 1. Fetch Application
        const [application] = await db.select().from(arReceiptApplications).where(eq(arReceiptApplications.id, applicationId));
        if (!application) throw new Error("Receipt Application not found");
        if (application.status === "Reversed") throw new Error("Application already reversed");

        // 2. Fetch Receipt & Invoice
        const receipt = await storage.getArReceipt(application.receiptId);
        const invoice = await storage.getArInvoice(application.invoiceId);
        if (!receipt || !invoice) throw new Error("Linked Receipt or Invoice not found");

        const amountToUnapply = Number(application.amountApplied);

        // 3. Update Application Status
        await storage.updateArReceiptApplication(applicationId, { status: "Reversed" });

        // 4. Restore Receipt Balance
        const newUnapplied = Number(receipt.unappliedAmount) + amountToUnapply;
        await storage.updateArReceipt(receipt.id, {
            unappliedAmount: String(newUnapplied),
            status: "Unapplied" // If it has balance, it's unapplied/partially applied
        });

        // 5. Update Invoice Status
        // Re-calc total applied excluding this reversal
        const allApps = await storage.listArReceiptApplications(undefined, invoice.id);
        const validApps = allApps.filter(a => a.id !== applicationId && a.status !== "Reversed");
        const totalApplied = validApps.reduce((sum, a) => sum + Number(a.amountApplied), 0);

        // Determine status
        let newStatus = "Sent";
        if (totalApplied > 0) newStatus = "PartiallyPaid";
        // Check if overdue? Leave as Sent/Partially for now, Dunning Update will catch overdue.

        await storage.updateArInvoiceStatus(invoice.id, newStatus);

        // 6. Trigger SLA Reversal (Negative Amount)
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            // Unapply reverses the application accounting (Dr Receivable, Cr Unapplied)
            // But strict reversal uses Negative Amounts on "Applied" event or dedicated "Unapplied" event if JLTs differ.
            // Using AR_RECEIPT_UNAPPLIED event.

            await slaEngine.createAccounting({
                eventClassId: "AR_RECEIPT",
                eventTypeId: "AR_RECEIPT_UNAPPLIED",
                entityId: application.id,
                entityTable: "ar_receipt_applications",
                description: `Unapply Receipt: ${amountToUnapply} from ${invoice.invoiceNumber}`,
                amount: amountToUnapply, // Positive amount, but JLT may swap sides or we send neg?
                // Standard: Unapply Event Dr Receivable Cr Unapplied (Reverse of Apply).
                // Let's assume JLTs handle Direction (Dr Receivable, Cr Unapplied).
                currencyCode: invoice.currency || "USD",
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: {
                    receiptNumber: receipt.id.slice(0, 8),
                    receiptId: receipt.id,
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    accountId: receipt.accountId,
                    amount: amountToUnapply
                }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for unapplication:", err);
        }
    }

    // Premium Features: Seeding
    async seedDemoData(): Promise<void> {
        // 1. Create rich customers (Parties)
        const custs = [
            { name: "Globex Corporation", customerType: "Commercial", contactEmail: "finance@globex.com" },
            { name: "Initech LLC", customerType: "Commercial", contactEmail: "ar@initech.co" },
        ];

        for (const c of custs) {
            const party = await this.createCustomer(c as any);

            // 2. Create Account for Party
            const account = await this.createAccount({
                customerId: party.id,
                accountName: `${party.name} Main Account`,
                accountNumber: `ACC-${party.name.slice(0, 3).toUpperCase()}-001`,
                creditLimit: "50000",
                riskCategory: "Low"
            });

            // 3. Create Sites for Account
            const billTo = await this.createSite({
                accountId: account.id,
                siteName: "Primary Billing Site",
                address: party.address || "123 Business Way, Suit 100",
                isBillTo: true,
                isShipTo: false
            });

            const shipTo = await this.createSite({
                accountId: account.id,
                siteName: "Main Warehouse",
                address: "456 Logistics Blvd",
                isBillTo: false,
                isShipTo: true
            });

            // 4. Create rich invoices linked to Account/Site
            const invs = [
                {
                    customerId: party.id,
                    accountId: account.id,
                    siteId: billTo.id,
                    invoiceNumber: `INV-${party.name.slice(0, 3).toUpperCase()}-001`,
                    amount: "2500",
                    taxAmount: "250",
                    totalAmount: "2750",
                    status: "Sent",
                    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                },
                {
                    customerId: party.id,
                    accountId: account.id,
                    siteId: billTo.id,
                    invoiceNumber: `INV-${party.name.slice(0, 3).toUpperCase()}-002`,
                    amount: "12000",
                    taxAmount: "1200",
                    totalAmount: "13200",
                    status: "Overdue",
                    dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
                }
            ];

            for (const inv of invs) {
                await this.createInvoice(inv as any);
            }
        }
    }

    async toggleCreditHold(accountId: string, hold: boolean): Promise<ArCustomerAccount> {
        return await storage.updateArCustomerAccount(accountId, { creditHold: hold }) as ArCustomerAccount;
    }

    async getAccountBalance(accountId: string) {
        const invoices = await storage.listArInvoices();
        const receipts = await storage.listArReceipts();

        const accountInvoices = invoices.filter(i => i.accountId === accountId && i.status !== "Cancelled");
        const accountReceipts = receipts.filter(r => r.accountId === accountId && r.status !== "Reversed");

        // Outstanding Invoices
        const totalInvoiced = accountInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);

        // Receipts applied or available
        const totalPaid = accountReceipts.reduce((sum, r) => sum + (Number(r.amount) - Number(r.unappliedAmount)), 0);

        // Unapplied / On Account (Customer's money we hold)
        const totalUnapplied = accountReceipts
            .filter(r => r.status === "Unapplied" || r.status === "OnAccount")
            .reduce((sum, r) => sum + Number(r.unappliedAmount), 0);

        return {
            totalInvoiced,
            totalPaid,
            totalUnapplied,
            outstanding: totalInvoiced - totalPaid,
            netBalance: (totalInvoiced - totalPaid) - totalUnapplied // What they actually owe us right now
        };
    }

    async calculateCreditScore(accountId: string): Promise<void> {
        // Fire & Forget Async Worker
        CreditScoreWorker.calculateScore(accountId).catch(err => {
            console.error(`[BG] Credit Score calculation failed for ${accountId}:`, err);
        });
    }


    // ... (existing code)

    // Revenue Management
    async listRevenueRules(): Promise<ArRevenueRule[]> {
        return await storage.listArRevenueRules();
    }

    async createRevenueRule(data: InsertArRevenueRule): Promise<ArRevenueRule> {
        return await storage.createArRevenueRule(data);
    }

    async recognizeRevenue(scheduleId: string): Promise<ArRevenueSchedule> {
        const schedule = await storage.getArRevenueSchedule(scheduleId);
        if (!schedule) throw new Error("Schedule not found");
        if (schedule.status === "Recognized") return schedule;

        const updated = await storage.updateArRevenueSchedule(scheduleId, { status: "Recognized" });

        // Trigger SLA Event
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            // Need to fetch invoice to get currency
            const invoice = await storage.getArInvoice(schedule.invoiceId.toString());

            await slaEngine.createAccounting({
                eventClassId: "AR_REVENUE",
                eventTypeId: "AR_REV_REC_STD",
                entityId: schedule.id.toString(),
                entityTable: "ar_revenue_schedules",
                description: `Revenue Recognition for Schedule ${schedule.id}`,
                amount: Number(schedule.amount),
                currencyCode: invoice?.currency || "USD",
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: { invoiceId: schedule.invoiceId, ruleId: schedule.ruleId }
            });
        } catch (err) {
            console.error("SLA Accounting failed for Revenue Recognition:", err);
        }

        return updated!;
    }

    async listRevenueSchedules(status?: string): Promise<ArRevenueSchedule[]> {
        return await storage.listArRevenueSchedules(status);
    }

    // Collections & Dunning
    async createDunningTemplate(data: InsertArDunningTemplate): Promise<ArDunningTemplate> {
        return await storage.createArDunningTemplate(data);
    }

    async listDunningTemplates(): Promise<ArDunningTemplate[]> {
        return await storage.listArDunningTemplates();
    }

    async getDunningTemplate(id: string): Promise<ArDunningTemplate | undefined> {
        return await storage.getArDunningTemplate(id);
    }



    async createDunningRun(): Promise<{ run: ArDunningRun; tasks: number }> {
        // 1. Create Run Record (Status: New)
        const run = await storage.createArDunningRun({
            runDate: new Date(),
            status: "New",
            totalInvoicesProcessed: 0,
            totalLettersGenerated: 0
        });

        // 2. Trigger Worker (Fire & Forget)
        DunningWorker.processRun(run.id).catch(err => {
            console.error(`[BG] Dunning Run ${run.id} failed to start:`, err);
        });

        return { run, tasks: 0 }; // Return immediately
    }

    async listCollectorTasks(assignedTo?: string, status?: string): Promise<ArCollectorTask[]> {
        return await storage.listArCollectorTasks(assignedTo, status);
    }

    async updateCollectorTask(id: string, data: Partial<InsertArCollectorTask>): Promise<ArCollectorTask | undefined> {
        return await storage.updateArCollectorTask(id, data);
    }

    // AR Adjustments
    async createAdjustment(data: InsertArAdjustment): Promise<ArAdjustment> {
        // 1. Validate Amount
        const invoice = await storage.getArInvoice(data.invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        const applications = await storage.listArReceiptApplications(undefined, invoice.id);
        const adjustments = await storage.listArAdjustments(invoice.id);
        const appliedTotal = applications.reduce((sum, app) => sum + Number(app.amountApplied), 0);
        const adjustedTotal = adjustments.reduce((sum, adj) => sum + Number(adj.amount), 0);
        const outstanding = Number(invoice.totalAmount) - appliedTotal + adjustedTotal;

        if (data.adjustmentType === "WriteOff") {
            // Write-off amount is negative usually, but let's assume input is positive for "amount to write off"
            // If data.amount is negative in DB, we should handle that.
            // Convention: Write-offs are Credit adjustments (negative effect on balance).
            // Let's assume the API passes a negative number for write-off reduction.
            if (Number(data.amount) > 0) {
                // If Positive, it INCREASES balance. Write-off should DECREASE.
                // So if type is WriteOff, ensure amount is negative??
                // Or we enforce Negative in the UI?
                // Let's assume signed input.
            }

            // Check if attempting to write off more than outstanding?
            // If amount is -100, and outstanding is 50. New balance = -50.
            // Over-crediting is allowed (Credit Memo style), but "Write Off" usually caps at balance.
            // For now, allow it but log warning? Or block.
            // Let's block over-write-off.
            if (Math.abs(Number(data.amount)) > outstanding + 0.01 && Number(data.amount) < 0) {
                throw new Error(`Cannot write off more than outstanding balance (${outstanding})`);
            }
        }

        const adjustment = await storage.createArAdjustment(data);

        // 2. SLA Event
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            await slaEngine.createAccounting({
                eventClassId: "AR_ADJUSTMENT",
                eventTypeId: "AR_ADJUSTMENT_CREATED",
                entityId: adjustment.id,
                entityTable: "ar_adjustments",
                description: `${adjustment.adjustmentType} for ${invoice.invoiceNumber}`,
                amount: Math.abs(Number(adjustment.amount)),
                currencyCode: invoice.currency || "USD",
                eventDate: new Date(),
                glDate: new Date(),
                ledgerId,
                sourceData: {
                    invoiceNumber: invoice.invoiceNumber,
                    adjustmentType: adjustment.adjustmentType,
                    amount: adjustment.amount,
                    invoiceId: invoice.id,
                    glAccountId: adjustment.glAccountId
                }
            });
        } catch (e) {
            console.error("SLA Error Adjustment", e);
        }

        // 3. Update Invoice Status if Zero Balance
        // Re-calc balance including new adjustment
        const newOutstanding = outstanding + Number(data.amount); // amount is negative for reduction
        if (Math.abs(newOutstanding) < 0.01) {
            await storage.updateArInvoiceStatus(invoice.id, "Paid"); // Or Closed/WrittenOff
        }

        return adjustment;
    }

    async listAdjustments(invoiceId: string): Promise<ArAdjustment[]> {
        return await storage.listArAdjustments(invoiceId);
    }

    async generateAiCollectionEmail(invoiceId: string): Promise<string> {
        const invoice = await storage.getArInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");
        const customer = await storage.getArCustomer(invoice.customerId);

        // Real AI Generation via ArAiService
        return await arAiService.generateCollectionEmail(invoice, customer);
    }

    // AR Period Close & Reconciliation
    async listPeriods(ledgerId: string = "PRIMARY") {
        return await storage.listArPeriods();
    }

    async checkPeriodCloseExceptions(periodName: string): Promise<string[]> {
        const exceptions: string[] = [];

        // 1. Check for Unaccounted Invoices in Period
        // Simplification: We don't have explicit "Accounted" flag in minimal schema yet, 
        // but we can check for "Draft" status invoices that should be "Sent" or processed.
        // Or check for NULL gl_journal_id linkage if we had that.
        // For now: Check for "Draft" invoices created in this period (assuming periodName is Mmm-YY)

        // Parse periodName to Date range (e.g. Jan-26)
        // ... Assuming robust date parsing utils exist or we do simple string match for demo

        // Placeholder Exception Check
        const pendingRevenue = await storage.listArRevenueSchedules("Pending");
        if (pendingRevenue.length > 0) {
            // exceptions.push(`${pendingRevenue.length} Pending Revenue Schedules found.`);
        }

        // Check for Unapplied Receipts (soft warning)
        const receipts = await storage.listArReceipts();
        const unapplied = receipts.filter(r => r.status === "Unapplied");
        if (unapplied.length > 0) {
            exceptions.push(`Warning: ${unapplied.length} Unapplied Receipts exist.`);
        }

        // Real "Sweep" would check GL transfer status.

        return exceptions;
    }

    async closePeriod(periodName: string, auditId: string): Promise<{ success: boolean; errors: string[] }> {
        // 1. Run Exception Check
        const exceptions = await this.checkPeriodCloseExceptions(periodName);

        // Block if critical exceptions (for now only blocking on hypothetical ones, treating warnings as pass-through with alert)
        // if (exceptions.some(e => e.startsWith("Critical"))) return { success: false, errors: exceptions };

        // 2. Close Period
        await storage.updateArPeriodStatus(periodName, "Closed", auditId);

        // 3. Trigger GL Period Close Prep?
        // (Optional integration)

        return { success: true, errors: exceptions };
    }
}

export const arService = new ArService();

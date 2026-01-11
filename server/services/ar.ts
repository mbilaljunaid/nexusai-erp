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
    ArSystemOptions
} from "@shared/schema";
import { financeService } from "./finance";
import { slaService } from "./SlaService";
import { db } from "../db";
import { glLedgers } from "@shared/schema";

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

    // Invoices
    async listInvoices(): Promise<ArInvoice[]> {
        return await storage.listArInvoices();
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

            let eventClass = "AR_INVOICE_CREATED";
            if (invoice.transactionClass === "CM") eventClass = "AR_CM_CREATED";
            if (invoice.transactionClass === "DM") eventClass = "AR_DM_CREATED";
            if (invoice.transactionClass === "CB") eventClass = "AR_CB_CREATED";

            await slaService.createAccounting({
                eventClass,
                entityId: invoice.id,
                entityTable: "ar_invoices",
                description: `${invoice.transactionClass} transaction: ${invoice.invoiceNumber}`,
                amount: Number(invoice.totalAmount),
                currency: invoice.currency || "USD",
                date: new Date(),
                ledgerId,
                sourceData: {
                    customerId: invoice.customerId,
                    accountId: invoice.accountId,
                    class: invoice.transactionClass,
                    revenueRuleId: invoice.revenueRuleId
                }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for transaction:", err);
        }

        return invoice;
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

            await slaService.createAccounting({
                eventClass: "AR_CM_APPLICATION",
                entityId: cm.id, // Using CM ID as base
                entityTable: "ar_invoices",
                description: `Applied CM ${cm.invoiceNumber} to ${invoice.invoiceNumber}`,
                amount: amount,
                currency: cm.currency || "USD",
                date: new Date(),
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
        // Initialize unappliedAmount to total amount if not set
        const receiptData = {
            ...data,
            unappliedAmount: data.unappliedAmount || data.amount,
            status: data.invoiceId ? "Applied" : "Unapplied"
        };
        const receipt = await storage.createArReceipt(receiptData);

        // If receipt is applied to an invoice, update invoice status and create application record
        if (receipt.invoiceId) {
            await this.applyReceipt(receipt.id, receipt.invoiceId, Number(receipt.amount));
        }

        // 2. Trigger SLA Accounting (for the receipt creation itself - Cash DR, Unapplied CR)
        try {
            const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            await slaService.createAccounting({
                eventClass: "AR_RECEIPT_CREATED", // New event class for initial receipt
                entityId: receipt.id,
                entityTable: "ar_receipts",
                description: `Customer Receipt: ${receipt.id.slice(0, 8)}`,
                amount: Number(receipt.amount),
                currency: "USD",
                date: new Date(),
                ledgerId,
                sourceData: { accountId: receipt.accountId, customerId: receipt.customerId }
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

        if (Number(receipt.unappliedAmount) < amount) {
            throw new Error(`Insufficient unapplied amount on receipt. Available: ${receipt.unappliedAmount}`);
        }

        // 1. Create Application Record
        const application = await storage.createArReceiptApplication({
            receiptId,
            invoiceId,
            amountApplied: String(amount),
            status: "Applied",
        });

        // 2. Update Receipt Unapplied Balance
        const newUnapplied = Number(receipt.unappliedAmount) - amount;
        await storage.updateArReceipt(receiptId, {
            unappliedAmount: String(newUnapplied),
            status: newUnapplied === 0 ? "Applied" : "Unapplied"
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

            await slaService.createAccounting({
                eventClass: "AR_RECEIPT_APPLIED",
                entityId: application.id,
                entityTable: "ar_receipt_applications",
                description: `Receipt Application: ${amount} to ${invoice.invoiceNumber}`,
                amount: amount,
                currency: invoice.currency || "USD",
                date: new Date(),
                ledgerId,
                sourceData: { receiptId, invoiceId, accountId: receipt.accountId }
            });
        } catch (err) {
            console.error("[AR] SLA Accounting failed for receipt application:", err);
        }

        return application;
    }

    async unapplyReceipt(applicationId: string): Promise<void> {
        // Implementation for unapplying (Reversal SLA, restore balances)
        // Deferred for immediate priority but structure is here
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
        const accountReceipts = receipts.filter(r => r.accountId === accountId);

        const totalInvoiced = accountInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
        const totalPaid = accountReceipts.reduce((sum, r) => sum + Number(r.amount), 0);

        return {
            totalInvoiced,
            totalPaid,
            outstanding: totalInvoiced - totalPaid
        };
    }

    async calculateCreditScore(accountId: string): Promise<number> {
        // 1. Get History
        const invoices = await storage.listArInvoices();
        const accountInvoices = invoices.filter(i => i.accountId === accountId && i.status === "Paid");

        let score = 100;

        // 2. Penalize for Late Payments
        // (Simple logic: -1 for every day late on avg, max -40)
        let totalDaysLate = 0;
        let invoiceCount = 0;

        for (const inv of accountInvoices) {
            // Need receipt date to calculate actual days late. 
            // For now, let's assume if it was paid, we check if it was paid after due date.
            // Since we don't have easy link to receipt date in invoice object without join, 
            // we will approximate using current date if we were finding open ones, but here we want history.
            // Simplified: If status is Paid, we assume it was paid. Ideally we need the receipt application date.
            // Let's use a simpler metric: % of invoices that were overdue at anytime (status history?)
            // Fallback: Use Current Overdue Status for immediate impact
        }

        const openInvoices = invoices.filter(i => i.accountId === accountId && i.status !== "Paid" && i.status !== "Cancelled");
        const overdueInvoices = openInvoices.filter(i => i.dueDate && new Date(i.dueDate) < new Date());

        // Penalty: -5 points for each overdue invoice
        score -= (overdueInvoices.length * 5);

        // 3. Utilization Penalty
        const { outstanding } = await this.getAccountBalance(accountId);
        const account = await storage.getArCustomerAccount(accountId);
        const limit = Number(account?.creditLimit) || 0;

        if (limit > 0) {
            const utilization = outstanding / limit;
            if (utilization > 0.9) score -= 20;
            else if (utilization > 0.75) score -= 10;
            else if (utilization > 0.5) score -= 5;
        }

        // 4. Update Account
        score = Math.max(0, Math.min(100, score));

        let risk = "Low";
        if (score < 50) risk = "High";
        else if (score < 75) risk = "Medium";

        await storage.updateArCustomerAccount(accountId, {
            creditScore: score,
            lastScoreUpdate: new Date(),
            riskCategory: risk
        });

        return score;
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

            await slaService.createAccounting({
                eventClass: "AR_REVENUE_RECOGNIZED",
                entityId: schedule.id.toString(),
                entityTable: "ar_revenue_schedules",
                description: `Revenue Recognition for Schedule ${schedule.id}`,
                amount: Number(schedule.amount),
                currency: invoice?.currency || "USD",
                date: new Date(),
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
        // 1. Identify Overdue Invoices
        const allInvoices = await storage.listArInvoices();
        const overdue = allInvoices.filter(inv => {
            if (inv.status !== "Sent" && inv.status !== "PartiallyPaid" && inv.status !== "Overdue") return false;
            // Check due date
            if (!inv.dueDate) return false;
            return new Date(inv.dueDate) < new Date();
        });

        // 2. Fetch Templates
        const templates = await storage.listArDunningTemplates();
        let tasksCreated = 0;

        for (const inv of overdue) {
            // Calculate days overdue
            const dueDate = new Date(inv.dueDate!);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - dueDate.getTime());
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Find matching template (highest severity match)
            const match = templates.find(t => daysOverdue >= (t.daysOverdueMin || 0) && daysOverdue <= (t.daysOverdueMax || 9999));

            if (match) {
                // Check if task exists for this invoice recently? (Simplification: just create task)
                const existingTasks = await storage.listArCollectorTasks(undefined, "Open");
                const alreadyHasTask = existingTasks.some(t => t.invoiceId === inv.id && t.taskType === "Email" && t.status === "Open");

                if (!alreadyHasTask) {
                    await storage.createArCollectorTask({
                        customerId: inv.customerId,
                        invoiceId: inv.id,
                        taskType: "Email",
                        priority: match.severity || "Medium",
                        status: "Open",
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
                    });
                    tasksCreated++;
                }
            }
        }

        // 3. Create Run Record
        const run = await storage.createArDunningRun({
            runDate: new Date(),
            status: "Completed",
            totalInvoicesProcessed: overdue.length,
            totalLettersGenerated: tasksCreated
        });

        return { run, tasks: tasksCreated };
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
        await slaService.processArEvent("AR_ADJUSTMENT_CREATED", adjustment.id, {
            adjustmentType: adjustment.adjustmentType,
            amount: Number(adjustment.amount),
            invoiceId: invoice.id,
            currency: invoice.currency,
            glAccountId: adjustment.glAccountId
        });

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

        // Mock AI Generation
        return `Subject: Overdue Invoice ${invoice.invoiceNumber} - Action Required

Dear ${customer?.name || "Customer"},

This is a friendly reminder that invoice ${invoice.invoiceNumber} for amount ${invoice.currency} ${invoice.totalAmount} was due on ${new Date(invoice.dueDate!).toLocaleDateString()}.

Please remit payment at your earliest convenience.

Sincerely,
Collections Team`;
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

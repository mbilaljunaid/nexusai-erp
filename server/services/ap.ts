// Accounts Payable (AP) Service Layer
import { storage } from "../storage";
import { db } from "../db";
import { eq, and, sql, desc, gte, lte, or, not } from "drizzle-orm";
import {
    type InsertApSupplier, type InsertApInvoice, type InsertApPayment, type ApSupplier, type ApInvoice, type ApPayment, type InsertApInvoiceLine, type InsertApInvoiceDistribution,
    apSuppliers, apInvoices, apInvoiceLines, apInvoiceDistributions, apPayments, apHolds,
    apSupplierSites, insertApSupplierSiteSchema, insertApSupplierSchema, insertApInvoiceSchema,
    apSystemParameters, apDistributionSets, apDistributionSetLines,
    apPaymentBatches, apInvoicePayments, glLedgers, glPeriods,
    apAuditLogs, apPeriodStatuses, apPrepayApplications,
    apWhtGroups, apWhtRates,
    type InsertApSystemParameters, type InsertApDistributionSet, type InsertApDistributionSetLine,
    type InsertApPaymentBatch
} from "@shared/schema";
import { slaService } from "./SlaService";

export interface CreateInvoicePayload {
    header: InsertApInvoice;
    lines: InsertApInvoiceLine[];
    distributions?: InsertApInvoiceDistribution[];
}

export class ApService {
    async listInvoices() {
        return storage.listApInvoices();
    }

    // Placeholder for seed (can be reimplemented fully later)
    async seedDemoData() {
        // Re-implement if needed, or leave empty for now to satisfy type checker
        return { message: "Seed not implemented for enterprise schema yet" };
    }

    // Placeholder for toggle (can be reimplemented fully later)
    async toggleCreditHold(supplierId: string, hold: boolean) {
        return storage.updateApSupplier(supplierId, { creditHold: hold });
    }

    async getInvoice(id: string) {
        const invoice = await storage.getApInvoice(id);
        if (!invoice) return undefined;

        // Fetch lines
        const lines = await storage.getApInvoiceLines(invoice.id);
        return { ...invoice, lines };
    }

    // 1. Create Supplier with Auto-Site Logic
    async createSupplier(data: InsertApSupplier) {
        // Validate
        const validation = insertApSupplierSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(`Invalid supplier data: ${validation.error.message}`);
        }

        // Create Parent Supplier
        const [supplier] = await db.insert(apSuppliers).values(data).returning();

        // Auto-Create Default Site (HEADQUARTERS) for backward compatibility
        if (supplier.id) {
            await this.createSupplierSite({
                supplierId: supplier.id,
                siteName: "HEADQUARTERS",
                address: data.address || null, // Inherit from parent payload
                taxId: data.taxId || null,
                paymentTermsId: data.paymentTermsId || null,
                isPaySite: true,
                isPurchasingSite: true
            });
        }

        return supplier;
    }

    // 1.1 Create Supplier Site (New)
    async createSupplierSite(data: typeof apSupplierSites.$inferInsert) {
        const validation = insertApSupplierSiteSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(`Invalid site data: ${validation.error.message}`);
        }

        // Ensure site name is unique per supplier
        const existing = await db.select().from(apSupplierSites)
            .where(and(
                eq(apSupplierSites.supplierId, data.supplierId),
                eq(apSupplierSites.siteName, data.siteName || "")
            )).limit(1);

        if (existing.length > 0) {
            throw new Error(`Site '${data.siteName}' already exists for this supplier.`);
        }

        const [site] = await db.insert(apSupplierSites).values(data).returning();
        return site;
    }

    async updateApInvoice(id: string, data: Partial<InsertApInvoice>) {
        const [updated] = await db.update(apInvoices).set({ ...data, updatedAt: new Date() }).where(eq(apInvoices.id, parseInt(id))).returning();
        return updated;
    }

    // --- System Parameters ---

    async getSystemParameters() {
        const [params] = await db.select().from(apSystemParameters).limit(1);
        return params;
    }

    async updateSystemParameters(data: Partial<InsertApSystemParameters>) {
        const [existing] = await db.select().from(apSystemParameters).limit(1);
        if (existing) {
            const [updated] = await db.update(apSystemParameters)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(apSystemParameters.id, existing.id))
                .returning();
            return updated;
        } else {
            const [created] = await db.insert(apSystemParameters).values(data as any).returning();
            return created;
        }
    }

    // --- Distribution Sets ---

    async getDistributionSets() {
        return await db.select().from(apDistributionSets).orderBy(apDistributionSets.name);
    }

    async createDistributionSet(data: { header: InsertApDistributionSet, lines: InsertApDistributionSetLine[] }) {
        return await db.transaction(async (tx) => {
            const [header] = await tx.insert(apDistributionSets).values(data.header).returning();

            if (data.lines && data.lines.length > 0) {
                const linesWithId = data.lines.map(l => ({ ...l, distributionSetId: header.id }));
                await tx.insert(apDistributionSetLines).values(linesWithId);
            }

            return { ...header, lines: data.lines };
        });
    }

    async getDistributionSetLines(setId: number) {
        return await db.select().from(apDistributionSetLines).where(eq(apDistributionSetLines.distributionSetId, setId));
    }

    async getSupplierSites(supplierId: number) {
        return await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, supplierId));
    }

    async createInvoice(data: { header: InsertApInvoice; lines: InsertApInvoiceLine[] }) {
        const validation = insertApInvoiceSchema.safeParse(data.header);
        if (!validation.success) {
            throw new Error(`Invalid invoice header: ${validation.error.message}`);
        }

        return await db.transaction(async (tx) => {
            // 1. Resolve site ID
            let siteId = data.header.supplierSiteId;
            if (!siteId) {
                const sites = await tx.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, data.header.supplierId));
                const paySite = sites.find(s => s.isPaySite) || sites[0];
                if (paySite) siteId = paySite.id;
            }

            // 2. Insert Header
            const [invoice] = await tx.insert(apInvoices).values({
                ...data.header,
                supplierSiteId: siteId,
                invoiceStatus: "DRAFT",
                validationStatus: "NEVER VALIDATED"
            }).returning();

            // 3. Insert Lines
            if (data.lines && data.lines.length > 0) {
                const linesToInsert = data.lines.map((line, index) => ({
                    ...line,
                    invoiceId: invoice.id,
                    lineNumber: line.lineNumber || index + 1
                }));
                await tx.insert(apInvoiceLines).values(linesToInsert);
            }

            return { ...invoice, lines: data.lines };
        });
    }

    // This method was partially provided in the instruction, but the full context was not.
    // Assuming the original createInvoice method was intended to be replaced by the new one above,
    // and the lines/distributions logic should be integrated into the new createInvoice if needed.
    // For now, I'm keeping the original structure for lines/distributions as it was not fully replaced.
    async createInvoiceOld(payload: CreateInvoicePayload) { // Renamed to avoid conflict
        // 1. Create Header
        const invoice = await storage.createApInvoiceHeader(payload.header);

        // 2. Create Lines
        const createdLines = [];
        for (const line of payload.lines) {
            const createdLine = await storage.createApInvoiceLine({
                ...line,
                invoiceId: invoice.id
            });
            createdLines.push(createdLine);

            // 3. Create Distributions (if provided) - Simplified 1:1 for now if needed, or use separate logic
            if (payload.distributions) {
                const relatedDists = payload.distributions.filter(d => d.invoiceLineId === line.lineNumber); // Assumption: payload uses lineNumber to link
                for (const dist of relatedDists) {
                    await storage.createApInvoiceDistribution({
                        ...dist,
                        invoiceId: invoice.id,
                        invoiceLineId: createdLine.id
                    });
                }
            }
        }

        return { ...invoice, lines: createdLines };
    }

    // Validation Logic (Phase 2 Real Implementation)
    async validateInvoice(invoiceId: number): Promise<{ status: string, holds: string[] }> {
        console.log(`Validating Invoice ${invoiceId}...`);

        // 1. Fetch Invoice, Lines, and Parameters
        const [invoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoiceId)).limit(1);
        if (!invoice) throw new Error("Invoice not found");

        const lines = await db.select().from(apInvoiceLines).where(eq(apInvoiceLines.invoiceId, invoiceId));
        const params = await this.getSystemParameters();

        // Clear existing active holds
        await db.delete(apHolds).where(and(
            eq(apHolds.invoice_id, invoiceId),
            sql`${apHolds.release_lookup_code} IS NULL`
        ));

        const holds: string[] = [];
        const headerAmount = Number(invoice.invoiceAmount);
        const linesTotal = lines.reduce((sum, line) => sum + Number(line.amount), 0);

        // 2. Line Variance Check
        const tolerance = params?.amountTolerance ? Number(params.amountTolerance) : 0.05;
        if (Math.abs(headerAmount - linesTotal) > tolerance) {
            holds.push("LINE_VARIANCE");
            await db.insert(apHolds).values({
                invoice_id: invoiceId,
                hold_lookup_code: "LINE_VARIANCE",
                hold_type: "GENERAL",
                hold_reason: `Header (${headerAmount}) matches Lines (${linesTotal}) with tolerance ${tolerance}`,
                held_by: 1
            });
        }

        // 3. Duplicate Invoice Check
        const duplicates = await db.select().from(apInvoices).where(and(
            eq(apInvoices.supplierId, invoice.supplierId),
            eq(apInvoices.invoiceNumber, invoice.invoiceNumber),
            eq(apInvoices.invoiceAmount, invoice.invoiceAmount),
            sql`${apInvoices.id} != ${invoiceId}`
        ));

        if (duplicates.length > 0) {
            holds.push("DUPLICATE_INVOICE");
            await db.insert(apHolds).values({
                invoice_id: invoiceId,
                hold_lookup_code: "DUPLICATE_INVOICE",
                hold_type: "GENERAL",
                hold_reason: `Duplicate of Invoice ID ${duplicates[0].id}`,
                held_by: 1
            });
        }

        // 4. Update Status (Use the new invoiceStatus column)
        const validationStatus = holds.length > 0 ? "NEEDS REVALIDATION" : "VALIDATED";
        const invoiceStatus = holds.length > 0 ? "DRAFT" : "VALIDATED";

        // 5. Advanced Withholding Tax (WHT) Calculation
        let totalWhtAmount = 0;
        const [supplier] = await db.select().from(apSuppliers).where(eq(apSuppliers.id, invoice.supplierId)).limit(1);

        if (validationStatus === "VALIDATED" && supplier?.allowWithholdingTax) {
            if (supplier.withholdingTaxGroupId) {
                // Multi-Tier WHT Logic
                const rates = await db.select().from(apWhtRates)
                    .where(and(
                        eq(apWhtRates.groupId, supplier.withholdingTaxGroupId),
                        eq(apWhtRates.enabledFlag, true)
                    ))
                    .orderBy(apWhtRates.priority);

                for (const rate of rates) {
                    const rateAmount = headerAmount * (Number(rate.ratePercent) / 100);
                    totalWhtAmount += rateAmount;

                    // In a full implementation, we'd insert separate WHT distributions here
                    console.log(`[WHT] Applied rate ${rate.taxRateName} (${rate.ratePercent}%): $${rateAmount}`);
                }
            } else {
                // Backward compatibility: 10% stub
                totalWhtAmount = headerAmount * 0.1;
            }
        }

        const whtAmountStr = totalWhtAmount.toFixed(2);

        await db.update(apInvoices)
            .set({
                validationStatus,
                invoiceStatus,
                withholdingTaxAmount: whtAmountStr,
                approvalStatus: validationStatus === "VALIDATED" ? "REQUIRED" : "NOT REQUIRED",
                updatedAt: new Date()
            })
            .where(eq(apInvoices.id, invoiceId));

        // Audit Logging
        await this.logAuditAction("SYSTEM", "VALIDATE", "INVOICE", String(invoiceId),
            `Invoice validated with status ${validationStatus}. Total WHT: ${whtAmountStr}`);

        // 6. Trigger Accounting if Validated
        if (validationStatus === "VALIDATED") {
            try {
                // Fetch default ledger
                const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
                const ledgerId = ledger?.id || "PRIMARY";

                await slaService.createAccounting({
                    eventClass: "AP_INVOICE_VALIDATED",
                    entityId: String(invoiceId),
                    entityTable: "ap_invoices",
                    description: `Invoice ${invoice.invoiceNumber} Validated (WHT: ${whtAmountStr})`,
                    amount: Number(invoice.invoiceAmount),
                    currency: invoice.invoiceCurrencyCode,
                    date: new Date(),
                    ledgerId,
                    sourceData: { supplierId: invoice.supplierId, withholdingAmount: whtAmountStr }
                });
            } catch (err) {
                console.error(`[AP] Accounting failed for invoice ${invoiceId}:`, err);
            }
        }

        return { status: validationStatus, holds };
    }

    async generateAccounting(invoiceId: number) {
        const [invoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoiceId)).limit(1);
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.validationStatus !== "VALIDATED") throw new Error("Only validated invoices can be accounted");

        const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
        const ledgerId = ledger?.id || "PRIMARY";

        return await slaService.createAccounting({
            eventClass: "AP_INVOICE_VALIDATED",
            entityId: String(invoiceId),
            entityTable: "ap_invoices",
            description: `Invoice ${invoice.invoiceNumber} Accounting`,
            amount: Number(invoice.invoiceAmount),
            currency: invoice.invoiceCurrencyCode,
            date: new Date(),
            ledgerId,
            sourceData: { supplierId: invoice.supplierId }
        });
    }

    async matchInvoiceToPO(invoiceId: number, matchData: { lineNumber: number, poHeaderId: string, poLineId: string, poUnitPrice: number, poQuantity: number }) {
        console.log(`Matching Invoice ${invoiceId} Line ${matchData.lineNumber} to PO ${matchData.poHeaderId}`);

        const params = await this.getSystemParameters();
        const [line] = await db.select().from(apInvoiceLines).where(and(
            eq(apInvoiceLines.invoiceId, invoiceId),
            eq(apInvoiceLines.lineNumber, matchData.lineNumber)
        )).limit(1);

        if (!line) throw new Error("Invoice line not found");

        const invAmount = Number(line.amount);
        const poAmount = matchData.poUnitPrice * matchData.poQuantity;

        // Simple 2-Way Price Variance Check
        const priceTolerance = params?.priceTolerancePercent ? Number(params.priceTolerancePercent) / 100 : 0.05;
        const variance = (invAmount - poAmount) / poAmount;

        if (variance > priceTolerance) {
            await db.insert(apHolds).values({
                invoice_id: invoiceId,
                line_location_id: line.id,
                hold_lookup_code: "PRICE_VARIANCE",
                hold_type: "PRICE_VARIANCE",
                hold_reason: `Price variance of ${(variance * 100).toFixed(2)}% exceeds tolerance of ${(priceTolerance * 100).toFixed(2)}%`,
                held_by: 1
            });
        }

        // Update Line with PO reference
        await db.update(apInvoiceLines)
            .set({
                poHeaderId: matchData.poHeaderId,
                poLineId: matchData.poLineId
            })
            .where(eq(apInvoiceLines.id, line.id));

        return { success: true, variance };
    }

    async getInvoiceHolds(invoiceId: number) {
        return await db.select().from(apHolds).where(eq(apHolds.invoice_id, invoiceId));
    }

    async releaseHold(holdId: number, releaseCode: string) {
        const [hold] = await db.update(apHolds)
            .set({ release_lookup_code: releaseCode })
            .where(eq(apHolds.id, holdId))
            .returning();
        return hold;
    }

    async applyPayment(invoiceId: string, paymentData: InsertApPayment): Promise<ApPayment | undefined> {
        return await db.transaction(async (tx) => {
            const [payment] = await tx.insert(apPayments).values(paymentData).returning();

            await tx.insert(apInvoicePayments).values({
                paymentId: payment.id,
                invoiceId: parseInt(invoiceId),
                amount: payment.amount,
                accountingDate: payment.paymentDate
            });

            await tx.update(apInvoices)
                .set({ paymentStatus: "PAID" })
                .where(eq(apInvoices.id, parseInt(invoiceId)));

            return payment;
        });
    }

    // --- PPR (Payment Process Request) Engine ---

    async listPaymentBatches() {
        return await db.select().from(apPaymentBatches).orderBy(sql`${apPaymentBatches.createdAt} DESC`);
    }

    async createPaymentBatch(data: InsertApPaymentBatch) {
        const [batch] = await db.insert(apPaymentBatches).values(data).returning();
        return batch;
    }

    async selectInvoicesForBatch(batchId: number, tx: any = db) {
        const [batch] = await tx.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batchId)).limit(1);
        if (!batch) throw new Error("Batch not found");

        const selectionCriteria = [
            eq(apInvoices.paymentStatus, "UNPAID"),
            eq(apInvoices.validationStatus, "VALIDATED"),
            sql`(${apInvoices.dueDate} <= ${batch.checkDate} OR ${apInvoices.dueDate} IS NULL)`
        ];

        // Logic to EXCLUDE invoices with active holds
        const invoicesWithHolds = tx.select({ id: apHolds.invoice_id })
            .from(apHolds)
            .where(sql`${apHolds.release_lookup_code} IS NULL`);

        const selectedInvoices = await tx.select()
            .from(apInvoices)
            .where(and(
                ...selectionCriteria,
                sql`${apInvoices.id} NOT IN (${invoicesWithHolds})`
            ));

        // Update batch with projected totals
        const total = selectedInvoices.reduce((sum: number, inv: any) => sum + Number(inv.invoiceAmount), 0);
        await tx.update(apPaymentBatches)
            .set({
                totalAmount: total.toString(),
                paymentCount: selectedInvoices.length,
                status: "SELECTED"
            })
            .where(eq(apPaymentBatches.id, batchId));

        return selectedInvoices;
    }

    async confirmPaymentBatch(batchId: number) {
        return await db.transaction(async (tx) => {
            const [batch] = await tx.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batchId)).limit(1);
            if (!batch || batch.status !== "SELECTED") throw new Error("Batch not ready for confirmation");

            const selectedInvoices = await this.selectInvoicesForBatch(batchId, tx);

            for (const invoice of selectedInvoices) {
                // 1. Create Payment
                const [payment] = await tx.insert(apPayments).values({
                    paymentDate: batch.checkDate,
                    amount: invoice.invoiceAmount,
                    currencyCode: invoice.invoiceCurrencyCode,
                    paymentMethodCode: batch.paymentMethodCode || "CHECK",
                    supplierId: invoice.supplierId,
                    batchId: batchId,
                    status: "NEGOTIABLE"
                }).returning();

                // 2. Link Payment to Invoice
                await tx.insert(apInvoicePayments).values({
                    paymentId: payment.id,
                    invoiceId: invoice.id,
                    amount: invoice.invoiceAmount,
                    accountingDate: batch.checkDate
                });

                // 3. Update Invoice
                await tx.update(apInvoices)
                    .set({ paymentStatus: "PAID", invoiceStatus: "PAID" })
                    .where(eq(apInvoices.id, invoice.id));
            }

            // 4. Update Batch Status
            await tx.update(apPaymentBatches)
                .set({ status: "CONFIRMED" })
                .where(eq(apPaymentBatches.id, batchId));

            // 5. Trigger Accounting for each payment
            const [ledger] = await tx.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
            const ledgerId = ledger?.id || "PRIMARY";

            for (const invoice of selectedInvoices) {
                await slaService.createAccounting({
                    eventClass: "AP_PAYMENT_CREATED",
                    entityId: String(invoice.id),
                    entityTable: "ap_invoices",
                    description: `Payment for Invoice ${invoice.invoiceNumber}`,
                    amount: Number(invoice.invoiceAmount),
                    currency: invoice.invoiceCurrencyCode,
                    date: batch.checkDate,
                    ledgerId,
                    sourceData: { supplierId: invoice.supplierId }
                });
            }

            return { success: true, count: selectedInvoices.length };
        });
    }
    async getBatchPayments(batchId: number) {
        return await db.select()
            .from(apPayments)
            .where(eq(apPayments.batchId, batchId))
            .orderBy(desc(apPayments.paymentDate));
    }

    // --- Audit Trail ---

    async logAuditAction(userId: string, action: string, entity: string, entityId: string, details?: string, before?: any, after?: any) {
        await db.insert(apAuditLogs).values({
            userId,
            action,
            entity,
            entityId,
            details,
            beforeState: before,
            afterState: after
        });
    }

    async getAuditTrail(filters: { entity?: string, entityId?: string, action?: string } = {}) {
        let query = db.select().from(apAuditLogs);
        const conditions = [];

        if (filters.entity) conditions.push(eq(apAuditLogs.entity, filters.entity));
        if (filters.entityId) conditions.push(eq(apAuditLogs.entityId, filters.entityId));
        if (filters.action) conditions.push(eq(apAuditLogs.action, filters.action));

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        return await query.orderBy(sql`${apAuditLogs.timestamp} DESC`);
    }

    // --- Aging Report ---

    async getAgingReport() {
        const results = await db.select({
            supplierName: apSuppliers.name,
            current: sql<number>`SUM(CASE WHEN ${apInvoices.dueDate} > NOW() THEN ${apInvoices.invoiceAmount} ELSE 0 END)`,
            days1_30: sql<number>`SUM(CASE WHEN ${apInvoices.dueDate} <= NOW() AND ${apInvoices.dueDate} > NOW() - INTERVAL '30 days' THEN ${apInvoices.invoiceAmount} ELSE 0 END)`,
            days31_60: sql<number>`SUM(CASE WHEN ${apInvoices.dueDate} <= NOW() - INTERVAL '30 days' AND ${apInvoices.dueDate} > NOW() - INTERVAL '60 days' THEN ${apInvoices.invoiceAmount} ELSE 0 END)`,
            days61_90: sql<number>`SUM(CASE WHEN ${apInvoices.dueDate} <= NOW() - INTERVAL '60 days' AND ${apInvoices.dueDate} > NOW() - INTERVAL '90 days' THEN ${apInvoices.invoiceAmount} ELSE 0 END)`,
            daysOver90: sql<number>`SUM(CASE WHEN ${apInvoices.dueDate} <= NOW() - INTERVAL '90 days' THEN ${apInvoices.invoiceAmount} ELSE 0 END)`,
            total: sql<number>`SUM(${apInvoices.invoiceAmount})`
        })
            .from(apInvoices)
            .innerJoin(apSuppliers, eq(apInvoices.supplierId, apSuppliers.id))
            .where(eq(apInvoices.paymentStatus, "UNPAID"))
            .groupBy(apSuppliers.name);

        return results;
    }

    // --- Period Close ---

    async getPeriods() {
        // Find GL periods and join with AP status
        const periods = await db.select({
            id: glPeriods.id,
            periodName: glPeriods.periodName,
            startDate: glPeriods.startDate,
            endDate: glPeriods.endDate,
            glStatus: glPeriods.status,
            apStatus: apPeriodStatuses.status
        })
            .from(glPeriods)
            .leftJoin(apPeriodStatuses, eq(glPeriods.id, apPeriodStatuses.periodId))
            .orderBy(sql`${glPeriods.startDate} DESC`);

        return periods.map(p => ({
            ...p,
            apStatus: p.apStatus || "OPEN" // Default to OPEN if no AP-specific record exists
        }));
    }

    async closePeriod(periodId: string, userId: string) {
        // 1. Check for unvalidated invoices
        const unvalidated = await db.select().from(apInvoices).where(and(
            eq(apInvoices.validationStatus, "NEVER VALIDATED"),
            // In real app, we would filter by GL date in the period
            // Assuming simplified period check for now
        ));

        if (unvalidated.length > 0) {
            throw new Error(`Cannot close period: ${unvalidated.length} invoices are unvalidated.`);
        }

        // 3. Update or Insert AP Period Status
        const [existing] = await db.select().from(apPeriodStatuses).where(eq(apPeriodStatuses.periodId, periodId)).limit(1);

        if (existing) {
            await db.update(apPeriodStatuses)
                .set({ status: "CLOSED", closedDate: new Date(), closedBy: userId })
                .where(eq(apPeriodStatuses.id, existing.id));
        } else {
            await db.insert(apPeriodStatuses).values({
                periodId,
                status: "CLOSED",
                closedDate: new Date(),
                closedBy: userId
            });
        }

        await this.logAuditAction(userId, "PERIOD_CLOSE", "PERIOD", periodId, `AP Period closed`);

        return { success: true };
    }

    // --- Prepayments & Credits ---

    async listAvailablePrepayments(supplierId: number) {
        return await db.select()
            .from(apInvoices)
            .where(and(
                eq(apInvoices.supplierId, supplierId),
                eq(apInvoices.invoiceType, "PREPAYMENT"),
                eq(apInvoices.paymentStatus, "PAID"),
                sql`${apInvoices.prepayAmountRemaining} > 0`
            ));
    }

    async applyPrepayment(standardInvoiceId: number, prepayId: number, amount: number, userId: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Invoices
            const [standard] = await tx.select().from(apInvoices).where(eq(apInvoices.id, standardInvoiceId)).limit(1);
            const [prepay] = await tx.select().from(apInvoices).where(eq(apInvoices.id, prepayId)).limit(1);

            if (!standard || !prepay) throw new Error("Invoice not found");
            if (Number(prepay.prepayAmountRemaining) < amount) throw new Error("Insufficient prepayment balance");

            // 2. Create Application
            await tx.insert(apPrepayApplications).values({
                standardInvoiceId,
                prepaymentInvoiceId: prepayId,
                amountApplied: amount.toString(),
                userId,
                status: "APPLIED"
            });

            // 3. Update Prepayment Balance
            const newRemaining = Number(prepay.prepayAmountRemaining) - amount;
            await tx.update(apInvoices)
                .set({ prepayAmountRemaining: newRemaining.toString() })
                .where(eq(apInvoices.id, prepayId));

            // 4. Update Standard Invoice Status? 
            // In a real ERP, we would check if it's now fully "paid" by prepayments
            const appliedTotal = await tx.select({
                sum: sql<number>`SUM(${apPrepayApplications.amountApplied})`
            })
                .from(apPrepayApplications)
                .where(and(
                    eq(apPrepayApplications.standardInvoiceId, standardInvoiceId),
                    eq(apPrepayApplications.status, "APPLIED")
                ));

            const totalPaid = Number(appliedTotal[0]?.sum || 0);
            if (totalPaid >= Number(standard.invoiceAmount)) {
                await tx.update(apInvoices)
                    .set({ paymentStatus: "PAID" })
                    .where(eq(apInvoices.id, standardInvoiceId));
            } else if (totalPaid > 0) {
                await tx.update(apInvoices)
                    .set({ paymentStatus: "PARTIAL" })
                    .where(eq(apInvoices.id, standardInvoiceId));
            }

            // 5. Audit
            await this.logAuditAction(userId, "PREPAY_APPLIED", "INVOICE", String(standardInvoiceId),
                `Applied $${amount} from Prepayment ${prepay.invoiceNumber}`);

            // 6. SLA Accounting (Simplified)
            try {
                const [ledger] = await tx.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
                const ledgerId = ledger?.id || "PRIMARY";

                await slaService.createAccounting({
                    eventClass: "AP_PREPAY_APPLICATION",
                    entityId: String(standardInvoiceId),
                    entityTable: "ap_invoices",
                    description: `Prepayment Application: ${prepay.invoiceNumber} to ${standard.invoiceNumber}`,
                    amount,
                    currency: standard.invoiceCurrencyCode,
                    date: new Date(),
                    ledgerId,
                    sourceData: { prepayId, standardId: standardInvoiceId }
                });
            } catch (err) {
                console.error("[AP] Prepay Accounting failed:", err);
            }

            return { success: true };
        });
    }

    async getPrepayApplications(invoiceId: number) {
        return await db.select({
            id: apPrepayApplications.id,
            prepaymentNumber: apInvoices.invoiceNumber,
            amountApplied: apPrepayApplications.amountApplied,
            accountingDate: apPrepayApplications.accountingDate,
            status: apPrepayApplications.status,
            prepaymentInvoiceId: apPrepayApplications.prepaymentInvoiceId
        })
            .from(apPrepayApplications)
            .innerJoin(apInvoices, eq(apPrepayApplications.prepaymentInvoiceId, apInvoices.id))
            .where(eq(apPrepayApplications.standardInvoiceId, invoiceId));
    }

    async unapplyPrepayment(applicationId: number, userId: string) {
        return await db.transaction(async (tx) => {
            const [app] = await tx.select().from(apPrepayApplications).where(eq(apPrepayApplications.id, applicationId)).limit(1);
            if (!app || app.status !== "APPLIED") throw new Error("Application not found or already unapplied");

            const amount = Number(app.amountApplied);

            // 1. Restore Prepayment Balance
            const [prepay] = await tx.select().from(apInvoices).where(eq(apInvoices.id, app.prepaymentInvoiceId)).limit(1);
            if (prepay) {
                const newRemaining = Number(prepay.prepayAmountRemaining) + amount;
                await tx.update(apInvoices)
                    .set({ prepayAmountRemaining: newRemaining.toString() })
                    .where(eq(apInvoices.id, prepay.id));
            }

            // 2. Update Application Status
            await tx.update(apPrepayApplications)
                .set({ status: "UNAPPLIED" })
                .where(eq(apPrepayApplications.id, applicationId));

            // 3. Update Standard Invoice Status
            const [standard] = await tx.select().from(apInvoices).where(eq(apInvoices.id, app.standardInvoiceId)).limit(1);
            if (standard) {
                const appliedTotal = await tx.select({
                    sum: sql<number>`SUM(${apPrepayApplications.amountApplied})`
                })
                    .from(apPrepayApplications)
                    .where(and(
                        eq(apPrepayApplications.standardInvoiceId, app.standardInvoiceId),
                        eq(apPrepayApplications.status, "APPLIED")
                    ));

                const totalPaid = Number(appliedTotal[0]?.sum || 0);
                let newStatus = "UNPAID";
                if (totalPaid > 0) newStatus = "PARTIAL";

                await tx.update(apInvoices)
                    .set({ paymentStatus: newStatus })
                    .where(eq(apInvoices.id, app.standardInvoiceId));
            }

            // 4. Audit
            await this.logAuditAction(userId, "PREPAY_UNAPPLIED", "INVOICE", String(app.standardInvoiceId),
                `Unapplied $${amount} for Application ID ${applicationId}`);

            return { success: true };
        });
    }

    async voidPayment(paymentId: number, userId: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Payment
            const [payment] = await tx.select().from(apPayments).where(eq(apPayments.id, paymentId)).limit(1);
            if (!payment || payment.status === "VOID") throw new Error("Payment not found or already voided");

            // 2. Fetch Linked Invoices
            const links = await tx.select().from(apInvoicePayments).where(eq(apInvoicePayments.paymentId, paymentId));

            // 3. Mark Payment as VOID
            await tx.update(apPayments)
                .set({ status: "VOID" })
                .where(eq(apPayments.id, paymentId));

            // 4. Revert Invoices status
            for (const link of links) {
                // Check if there are other payments still active for this invoice
                const otherPayments = await tx.select({
                    sum: sql<number>`SUM(${apInvoicePayments.amount})`
                })
                    .from(apInvoicePayments)
                    .innerJoin(apPayments, eq(apInvoicePayments.paymentId, apPayments.id))
                    .where(and(
                        eq(apInvoicePayments.invoiceId, link.invoiceId),
                        not(eq(apPayments.status, "VOID"))
                    ));

                const remainingPaid = Number(otherPayments[0]?.sum || 0);
                let newStatus = "UNPAID";
                if (remainingPaid > 0) newStatus = "PARTIAL";

                await tx.update(apInvoices)
                    .set({ paymentStatus: newStatus as any })
                    .where(eq(apInvoices.id, link.invoiceId));

                // Audit for each invoice
                await this.logAuditAction(userId, "PAYMENT_VOIDED", "INVOICE", String(link.invoiceId),
                    `Payment ${payment.paymentNumber} voided, invoice restored to ${newStatus}`);
            }

            // 5. Audit for Payment
            await this.logAuditAction(userId, "VOID", "PAYMENT", String(paymentId), `Payment VOIDED`);

            // 6. SLA Accounting reversal
            try {
                const [ledger] = await tx.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
                const ledgerId = ledger?.id || "PRIMARY";

                await slaService.createAccounting({
                    eventClass: "AP_PAYMENT_VOIDED",
                    entityId: String(paymentId),
                    entityTable: "ap_payments",
                    description: `Reversal for Payment ${payment.paymentNumber}`,
                    amount: Number(payment.amount),
                    currency: payment.currencyCode,
                    date: new Date(),
                    ledgerId,
                    sourceData: { paymentId }
                });
            } catch (err) {
                console.error("[AP] Void Accounting failed:", err);
            }

            return { success: true };
        });
    }

    async clearPayment(paymentId: number, userId: string) {
        const [payment] = await db.select().from(apPayments).where(eq(apPayments.id, paymentId)).limit(1);
        if (!payment || payment.status !== "NEGOTIABLE") throw new Error("Payment not found or not negotiable");

        await db.update(apPayments)
            .set({ status: "CLEARED" })
            .where(eq(apPayments.id, paymentId));

        await this.logAuditAction(userId, "CLEAR", "PAYMENT", String(paymentId), `Payment marked as CLEARED`);
        return { success: true };
    }
}

export const apService = new ApService();

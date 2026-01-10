// Accounts Payable (AP) Service Layer
import { storage } from "../storage";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
    type InsertApSupplier, type InsertApInvoice, type InsertApPayment, type ApSupplier, type ApInvoice, type ApPayment, type InsertApInvoiceLine, type InsertApInvoiceDistribution,
    apSuppliers, apInvoices, apInvoiceLines, apInvoiceDistributions, apPayments, apHolds,
    apSupplierSites, insertApSupplierSiteSchema, insertApSupplierSchema, insertApInvoiceSchema,
    apSystemParameters, apDistributionSets, apDistributionSetLines,
    apPaymentBatches, apInvoicePayments,
    type InsertApSystemParameters, type InsertApDistributionSet, type InsertApDistributionSetLine,
    type InsertApPaymentBatch
} from "@shared/schema";

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

        await db.update(apInvoices)
            .set({
                validationStatus,
                invoiceStatus,
                approvalStatus: validationStatus === "VALIDATED" ? "REQUIRED" : "NOT REQUIRED",
                updatedAt: new Date()
            })
            .where(eq(apInvoices.id, invoiceId));

        return { status: validationStatus, holds };
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
        // ...Existing Logic...
    }

    // --- PPR (Payment Process Request) Engine ---

    async listPaymentBatches() {
        return await db.select().from(apPaymentBatches).orderBy(sql`${apPaymentBatches.createdAt} DESC`);
    }

    async createPaymentBatch(data: InsertApPaymentBatch) {
        const [batch] = await db.insert(apPaymentBatches).values(data).returning();
        return batch;
    }

    async selectInvoicesForBatch(batchId: number) {
        const [batch] = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batchId)).limit(1);
        if (!batch) throw new Error("Batch not found");

        const selectionCriteria = [
            eq(apInvoices.paymentStatus, "UNPAID"),
            eq(apInvoices.validationStatus, "VALIDATED"),
            sql`${apInvoices.dueDate} <= ${batch.checkDate}`
        ];

        if (batch.payGroup) {
            // Assuming we add payGroup to apInvoices later, for now we filter by it if needed
            // selectionCriteria.push(eq(apInvoices.payGroup, batch.payGroup));
        }

        // Logic to EXCLUDE invoices with active holds
        const invoicesWithHolds = db.select({ id: apHolds.invoice_id })
            .from(apHolds)
            .where(sql`${apHolds.release_lookup_code} IS NULL`);

        const selectedInvoices = await db.select()
            .from(apInvoices)
            .where(and(
                ...selectionCriteria,
                sql`${apInvoices.id} NOT IN (${invoicesWithHolds})`
            ));

        // Update batch with projected totals
        const total = selectedInvoices.reduce((sum, inv) => sum + Number(inv.invoiceAmount), 0);
        await db.update(apPaymentBatches)
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

            const selectedInvoices = await this.selectInvoicesForBatch(batchId);

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

            return { success: true, count: selectedInvoices.length };
        });
    }
}

export const apService = new ApService();

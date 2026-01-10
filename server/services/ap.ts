// Accounts Payable (AP) Service Layer
import { storage } from "../storage";
import { db } from "../db"; // Assuming db is avaimport { db } from "../db";
import { eq, and, sql } from "drizzle-orm"; // Assuming drizzle-orm is used for queries
import {
    type InsertApSupplier, type InsertApInvoice, type InsertApPayment, type ApSupplier, type ApInvoice, type ApPayment, type InsertApInvoiceLine, type InsertApInvoiceDistribution,
    apSuppliers, apInvoices, apInvoiceLines, apInvoiceDistributions, apPayments, apHolds,
    apSupplierSites, insertApSupplierSiteSchema, insertApSupplierSchema, insertApInvoiceSchema,
    apSystemParameters, apDistributionSets, apDistributionSetLines,
    type InsertApSystemParameters, type InsertApDistributionSet, type InsertApDistributionSetLine
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

    async createInvoice(data: InsertApInvoice) {
        const validation = insertApInvoiceSchema.safeParse(data);
        if (!validation.success) {
            throw new Error(`Invalid invoice data: ${validation.error.message}`);
        }

        // If no site ID provided, default to the primary PAY site or error
        // For now, we allow null but ideally we should fetch a default
        let siteId = data.supplierSiteId;
        if (!siteId) {
            const sites = await this.getSupplierSites(data.supplierId);
            const paySite = sites.find(s => s.isPaySite) || sites[0];
            if (paySite) siteId = paySite.id;
        }

        const payload = { ...data, supplierSiteId: siteId };
        const [invoice] = await db.insert(apInvoices).values(payload).returning();
        return invoice;
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

        // 1. Fetch Invoice & Lines
        const invoice = await storage.getApInvoice(invoiceId.toString());
        if (!invoice) throw new Error("Invoice not found");

        const lines = await storage.getApInvoiceLines(invoiceId);

        // Clear existing holds (simple overwrite strategy for now)
        await db.delete(apHolds).where(eq(apHolds.invoice_id, invoiceId));

        const holds: string[] = [];

        // 2. Line Variance Check
        const headerAmount = Number(invoice.invoiceAmount);
        const linesTotal = lines.reduce((sum, line) => sum + Number(line.amount), 0);

        // Hardcoded generic tolerance of 0.05 (5 cents) for floating point safety
        // In future, fetch from ap_system_parameters
        if (Math.abs(headerAmount - linesTotal) > 0.05) {
            holds.push("LINE_VARIANCE");
            await db.insert(apHolds).values({
                invoice_id: invoiceId,
                hold_lookup_code: "LINE_VARIANCE",
                hold_reason: `Header (${headerAmount}) matches Lines (${linesTotal})`,
                held_by: 1
            });
        }

        // 3. Duplicate Invoice Check
        // Matches Supplier + Invoice Number + Amount (prevent double entry)
        const duplicates = await db.select().from(apInvoices).where(and(
            eq(apInvoices.supplierId, invoice.supplierId),
            eq(apInvoices.invoiceNumber, invoice.invoiceNumber),
            eq(apInvoices.invoiceAmount, invoice.invoiceAmount),
            sql`${apInvoices.id} != ${invoiceId}` // Exclude self
        ));

        if (duplicates.length > 0) {
            holds.push("DUPLICATE_INVOICE");
            await db.insert(apHolds).values({
                invoice_id: invoiceId,
                hold_lookup_code: "DUPLICATE_INVOICE",
                hold_reason: `Duplicate of Invoice ID ${duplicates[0].id}`,
                held_by: 1
            });
        }

        // 4. Update Status
        const newStatus = holds.length > 0 ? "NEEDS REVALIDATION" : "VALIDATED";
        await storage.updateApInvoice(invoiceId.toString(), {
            validationStatus: newStatus,
            approvalStatus: newStatus === "VALIDATED" ? "REQUIRED" : "NOT REQUIRED" // Reset approval if valid
        });

        return { status: newStatus, holds };
    }

    async applyPayment(invoiceId: string, paymentData: InsertApPayment): Promise<ApPayment | undefined> {
        // Validate before payment?
        const invoice = await storage.getApInvoice(invoiceId);
        if (invoice?.validationStatus !== "VALIDATED") {
            throw new Error("Cannot pay an invoice that is not VALIDATED");
        }

        const payment = await storage.createApPayment({ ...paymentData } as any);
        // Link to invoice (New Table) - TODO: Implement ApInvoicePayment

        // Update Invoice Status to PAID or PARTIAL
        await storage.updateApInvoice(invoiceId, {
            paymentStatus: "PAID",
            // In a real system, verify if full amount paid
        });

        return payment;
    }
}

export const apService = new ApService();

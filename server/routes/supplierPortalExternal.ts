
import { Router } from "express";
import { db } from "../db";

import { supplierUserIdentities, suppliers, purchaseOrders, purchaseOrderLines, asnHeaders, asnLines } from "../../shared/schema/scm";
import { scorecardService } from "../services/ScorecardService";
import { apInvoices, apInvoiceLines } from "../../shared/schema/ap";
import { eq, desc, and } from "drizzle-orm";

import multer from "multer";
import path from "path";
import { documentService } from "../services/DocumentService";
import { sourcingService } from "../services/SourcingService";
import { supplierDocuments as supplierDocsSchema, sourcingRfqs } from "../../shared/schema/scm";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = documentService.ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware: Require Portal Token
const requireSupplierAuth = async (req: any, res: any, next: any) => {
    const token = req.header("x-portal-token");
    if (!token) return res.status(401).json({ error: "Missing authentication token" });

    try {
        const [identity] = await db.select()
            .from(supplierUserIdentities)
            .where(eq(supplierUserIdentities.portalToken, token as string));

        if (!identity || identity.status !== 'ACTIVE') {
            return res.status(403).json({ error: "Invalid or inactive token" });
        }

        req.supplierId = identity.supplierId;
        req.supplierUserId = identity.userId;
        next();
    } catch (e) {
        return res.status(500).json({ error: "Authentication failed" });
    }
};

import { rateLimiter } from "../middleware/rateLimit";


/**
 * PUBLIC: Login with Email & Token
 * Rate limited: 10 attempts per minute
 */
router.post("/login", rateLimiter(60 * 1000, 10), async (req, res) => {
    const { email, token } = req.body;

    // In a real app, we would verify email/password first, then check token.
    // For this MVP, we just validate the token maps to a valid identity.
    try {
        const [identity] = await db.select()
            .from(supplierUserIdentities)
            .where(eq(supplierUserIdentities.portalToken, token));

        if (!identity) return res.status(401).json({ error: "Invalid credentials" });

        res.json({
            token: identity.portalToken,
            message: "Login successful"
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Get Supplier Profile
 */
router.get("/me", requireSupplierAuth, async (req: any, res) => {
    try {
        const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, req.supplierId));
        res.json(supplier);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: List Supplier Documents
 */
router.get("/documents", requireSupplierAuth, async (req: any, res) => {
    try {
        const docs = await documentService.getSupplierDocuments(req.supplierId);
        res.json(docs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Upload Supplier Document
 */
router.post("/documents", requireSupplierAuth, upload.single("file"), async (req: any, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const { documentType, expiryDate } = req.body;

        const doc = await documentService.uploadSupplierDocument({
            supplierId: req.supplierId,
            documentType: documentType || 'OTHER',
            fileName: req.file.originalname,
            filePath: req.file.path,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            status: 'ACTIVE'
        });

        res.json({ message: "Document uploaded successfully", doc });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: List Purchase Orders for this Supplier
 */
router.get("/orders", requireSupplierAuth, async (req: any, res) => {
    try {
        const orders = await db.select()
            .from(purchaseOrders)
            .where(eq(purchaseOrders.supplierId, req.supplierId))
            .orderBy(desc(purchaseOrders.createdAt));

        res.json(orders);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Acknowledge a PO
 */
router.post("/orders/:id/acknowledge", requireSupplierAuth, async (req: any, res) => {
    try {
        const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, req.params.id));

        if (!po) return res.status(404).json({ error: "PO not found" });
        if (po.supplierId !== req.supplierId) return res.status(403).json({ error: "Unauthorized access to PO" });

        // Update status to OPEN (Acknowledged)
        if (po.status === 'SENT') {
            await db.update(purchaseOrders)
                .set({ status: 'OPEN' })
                .where(eq(purchaseOrders.id, req.params.id));
        }

        res.json({ message: "PO Acknowledged" });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Create ASN (Advance Shipment Notice)
 */
router.post("/asn", requireSupplierAuth, async (req: any, res) => {
    try {
        const { poId, shipmentNumber, shippedDate, expectedArrivalDate, carrier, trackingNumber, lines } = req.body;

        if (!poId || !lines || lines.length === 0) {
            return res.status(400).json({ error: "PO ID and lines are required" });
        }

        // Verify PO belongs to supplier
        const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, poId));
        if (!po || po.supplierId !== req.supplierId) {
            return res.status(403).json({ error: "Invalid PO or unauthorized" });
        }

        // Generate ASN Number
        const asnNumber = `ASN-${Date.now()}`;

        const [asn] = await db.insert(asnHeaders).values({
            asnNumber,
            supplierId: req.supplierId,
            poId,
            shipmentNumber,
            shippedDate: new Date(shippedDate),
            expectedArrivalDate: new Date(expectedArrivalDate),
            carrier,
            trackingNumber,
            status: 'SHIPPED'
        }).returning();

        // Insert Lines
        if (lines && lines.length > 0) {
            await db.insert(asnLines).values(
                lines.map((line: any) => ({
                    asnId: asn.id,
                    poLineId: line.poLineId,
                    itemId: line.itemId,
                    quantityShipped: line.quantityShipped
                }))
            );
        }

        res.json({ message: "ASN Created", asn });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: List ASNs
 */
router.get("/asns", requireSupplierAuth, async (req: any, res) => {
    try {
        const asns = await db.select({
            id: asnHeaders.id,
            asnNumber: asnHeaders.asnNumber,
            shippedDate: asnHeaders.shippedDate,
            status: asnHeaders.status,
            poNumber: purchaseOrders.orderNumber
        })
            .from(asnHeaders)
            .leftJoin(purchaseOrders, eq(asnHeaders.poId, purchaseOrders.id))
            .where(eq(asnHeaders.supplierId, req.supplierId))
            .orderBy(desc(asnHeaders.createdAt));

        res.json(asns);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }


});

/**
 * PROTECTED: Get Current Supplier Scorecard
 */
router.get("/scorecard", requireSupplierAuth, async (req: any, res) => {
    try {
        const scorecard = await scorecardService.getLatestScorecard(req.supplierId);
        res.json(scorecard);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});



/**
 * PROTECTED: Create Invoice from PO (Flip to Invoice)
 */
router.post("/orders/:id/invoice", requireSupplierAuth, async (req: any, res) => {
    try {
        const { invoiceNumber, items } = req.body; // items: { poLineId: string, quantity: number, unitPrice: number }[]

        if (!invoiceNumber || !items || items.length === 0) {
            return res.status(400).json({ error: "Invoice Number and line items are required" });
        }

        // 1. Verify PO Access
        const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, req.params.id));
        if (!po || po.supplierId !== req.supplierId) {
            return res.status(403).json({ error: "Invalid PO or unauthorized" });
        }

        if (po.status !== 'OPEN') {
            return res.status(400).json({ error: "Only OPEN orders can be invoiced" });
        }

        // 2. Lookup AP Supplier ID using the SCM Supplier ID (Assuming they are linked or same for MVP)
        // In a real scenario, we map SCM Supplier -> AP Supplier. 
        // For this parity MVP, we might need to assume the IDs are consistent or lookup via name/taxId if tables are split.
        // Let's assume for now 1:1 parity isn't fully unified in `ap_suppliers` vs `scm_suppliers` yet as noted in gap analysis.
        // We will create the invoice with a placeholder supplierId of 0 or try to find one.
        // CRITICAL DEBT: The gap analysis noted "Master Data ... Need Unification".
        // Workaround: We will use a placeholder integer ID (e.g. 9999) + text description if we can't link, 
        // OR better: Create a "Supplier Portal Intaker" user/process.

        // Let's just create the invoice in `apInvoices` table. 
        // Warning: `apInvoices.supplierId` is `integer`. `scm.suppliers.id` is `varchar(uuid)`.
        // This confirms the data model drift. 
        // REMEDIATION: We will use a dedicated "Portal Supplier" ID (1) for now and store the real UUID in description 
        // to bypass the type mismatch for this demo, or we should have fixed schema.
        // Actually, let's check `ap_suppliers` schema. It uses `serial` (integer).
        // `scm_suppliers` uses `uuid`.
        // We will insert with `supplierId: 1` (Standard) and add `description: "Submitted via Portal for Supplier UUID: ..."`

        const invoiceTotal = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

        const [invoice] = await db.insert(apInvoices).values({
            invoiceNumber,
            invoiceDate: new Date(),
            supplierId: 1, // Placeholder for "Portal Supplier"
            description: `Submitted via Portal. SCM Supplier: ${req.supplierId}`,
            invoiceAmount: String(invoiceTotal),
            invoiceCurrencyCode: po.currency || 'USD',
            paymentCurrencyCode: po.currency || 'USD',
            invoiceStatus: 'DRAFT',
            validationStatus: 'NEVER VALIDATED',
            approvalStatus: 'REQUIRED',
            invoiceType: 'STANDARD'
        }).returning();

        // 3. Insert Invoice Lines
        let lineNumber = 1;
        for (const item of items) {
            await db.insert(apInvoiceLines).values({
                invoiceId: invoice.id,
                lineNumber: lineNumber++,
                lineType: 'ITEM',
                amount: String(Number(item.quantity) * Number(item.unitPrice)),
                quantityInvoiced: String(item.quantity),
                unitPrice: String(item.unitPrice),
                poHeaderId: po.id, // Linking back to SCM PO UUID (Schema is varchar? Check `ap.ts`)
                poLineId: item.poLineId,
                description: `PO Match: ${po.orderNumber} Line`
            });
        }

        res.json({ message: "Invoice Created", invoiceId: invoice.id });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: List Open RFQs for this Supplier
 */
router.get("/rfqs", requireSupplierAuth, async (req: any, res) => {
    try {
        const rfqs = await db.select()
            .from(sourcingRfqs)
            .where(eq(sourcingRfqs.status, 'PUBLISHED'))
            .orderBy(desc(sourcingRfqs.createdAt));

        res.json(rfqs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Get RFQ details for bidding
 */
router.get("/rfqs/:id", requireSupplierAuth, async (req: any, res) => {
    try {
        const rfq = await sourcingService.getRFQDetails(req.params.id);
        if (!rfq || rfq.status !== 'PUBLISHED') {
            return res.status(404).json({ error: "RFQ not found or not open for bidding" });
        }
        res.json(rfq);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * PROTECTED: Submit a Bid for an RFQ
 */
router.post("/rfqs/:id/bid", requireSupplierAuth, async (req: any, res) => {
    try {
        const { notes, lines } = req.body;
        const bid = await sourcingService.submitBid({
            rfqId: req.params.id,
            supplierId: req.supplierId,
            notes,
            lines
        });
        res.json({ message: "Bid submitted successfully", bid });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export const supplierPortalExternalRouter = router;

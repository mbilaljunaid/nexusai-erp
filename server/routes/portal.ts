
import { Router } from "express";
import { arService } from "../services/ar";
import { storage } from "../storage";
import { db } from "../db";
import { arCustomers, arDisputes, arDisputeAttachments, customerNotifications } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { pdfGenerator } from "../services/pdfGenerator";
import { notificationService } from "../services/notification";
import { uploadDisputeFiles } from "../middleware/uploadMiddleware";

const router = Router();

// Mock Auth Middleware for Portal
// In real app, we'd use JWT signed sessions. 
// For this MVP, we will use a simple header 'x-portal-customer-id' or a session cookie mocked.
// Let's implement a simple login that returns the Customer ID to be stored in client localStorage.

router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        // Find customer by email
        // Note: Our arCustomers schema has contactEmail.
        const [customer] = await db.select().from(arCustomers).where(eq(arCustomers.contactEmail, email));

        if (!customer) {
            return res.status(401).json({ message: "Invalid email or customer not found" });
        }

        // Return "Token" (Just the ID for this demo)
        res.json({
            token: customer.id,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.contactEmail
            }
        });
    } catch (error) {
        console.error("Portal Login Error:", error);
        res.status(500).json({ message: "Internal login error" });
    }
});

// Middleware to check portal auth
const requirePortalAuth = async (req: any, res: any, next: any) => {
    const customerId = req.headers['x-portal-token'];
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });

    // Verify existence?
    req.portalCustomerId = customerId;
    next();
};

router.get("/me", requirePortalAuth, async (req: any, res) => {
    try {
        const customer = await arService.getCustomer(req.portalCustomerId);
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        // Calculate Summary Stats
        const invoices = await arService.listInvoices();
        const myInvoices = invoices.filter(i => i.customerId === customer.id);
        const outstanding = myInvoices
            .filter(i => i.status !== "Paid" && i.status !== "Cancelled")
            .reduce((sum, i) => sum + Number(i.totalAmount), 0); // Need to subtract applied amount ideally

        // Refined Outstanding: existing getAccountBalance is per Account. Customer might have multiple.
        // Let's iterate accounts.
        const accounts = await arService.listAccounts(customer.id);
        let totalOutstanding = 0;
        let totalOverdue = 0;

        for (const acc of accounts) {
            const bal = await arService.getAccountBalance(acc.id);
            totalOutstanding += bal.outstanding;

            // Calc overdue
            const accInvs = invoices.filter(i => i.accountId === acc.id && i.status === "Overdue");
            totalOverdue += accInvs.reduce((sum, i) => sum + Number(i.totalAmount), 0);
        }

        res.json({
            ...customer,
            stats: {
                outstanding: totalOutstanding,
                overdue: totalOverdue,
                openInvoiceCount: myInvoices.filter(i => i.status !== "Paid").length
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

router.get("/invoices", requirePortalAuth, async (req: any, res) => {
    try {
        const allInvoices = await arService.listInvoices();
        // Filter by customer
        const mine = allInvoices.filter(i => i.customerId === req.portalCustomerId);
        // Sort by Date desc
        mine.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        res.json(mine);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch invoices" });
    }
});

router.post("/pay", requirePortalAuth, async (req: any, res) => {
    try {
        const { invoiceId, amount, paymentMethodId } = req.body;
        // Validate invoice belongs to customer
        const invoice = await arService.getInvoice(invoiceId);
        if (!invoice || invoice.customerId !== req.portalCustomerId) {
            return res.status(403).json({ message: "Invalid invoice" });
        }

        // Create Receipt
        // We'll auto-apply to this invoice
        const receipt = await arService.createReceipt({
            customerId: req.portalCustomerId,
            accountId: invoice.accountId,
            receiptNumber: `PAY-${Date.now()}`,
            amount: String(amount),
            receiptDate: new Date(),
            receiptMethodId: paymentMethodId || "CREDIT_CARD",
            status: "Applied",
            currency: invoice.currency || "USD",
            invoiceId: invoice.id
        } as any);

        res.json({ success: true, receiptId: receipt.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Payment failed" });
    }
});

/**
 * GET /payments
 * Get payment history for customer
 */
router.get("/payments", requirePortalAuth, async (req: any, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

        // Get all receipts for this customer
        const receipts = await arService.listReceipts();
        const myReceipts = receipts.filter(r => r.customerId === req.portalCustomerId);

        // Sort by date descending
        myReceipts.sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());

        // Limit if specified
        const result = limit ? myReceipts.slice(0, limit) : myReceipts;

        // Enhance with invoice numbers
        const enhanced = await Promise.all(result.map(async (receipt) => {
            let invoiceNumber = null;
            if (receipt.invoiceId) {
                const invoice = await arService.getInvoice(receipt.invoiceId);
                invoiceNumber = invoice?.invoiceNumber;
            }

            return {
                id: receipt.id,
                receiptNumber: receipt.receiptNumber,
                amount: receipt.amount,
                receiptDate: receipt.receiptDate,
                invoiceNumber,
                invoiceId: receipt.invoiceId,
                paymentMethod: receipt.receiptMethodId || "Unknown",
                status: receipt.status
            };
        }));

        res.json(enhanced);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payment history" });
    }
});

/**
 * GET /statements
 * Get monthly statements for customer
 */
router.get("/statements", requirePortalAuth, async (req: any, res) => {
    try {
        // For MVP, generate mock statements based on invoices
        // In production, this would be pre-generated monthly statements
        const invoices = await arService.listInvoices();
        const myInvoices = invoices.filter(i => i.customerId === req.portalCustomerId);

        // Group by month
        const statementMap = new Map<string, any>();

        myInvoices.forEach(inv => {
            const date = new Date(inv.createdAt || Date.now());
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!statementMap.has(period)) {
                statementMap.set(period, {
                    id: `stmt-${period}`,
                    period,
                    startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
                    endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
                    totalInvoiced: 0,
                    totalPaid: 0,
                    balance: 0
                });
            }

            const stmt = statementMap.get(period);
            stmt.totalInvoiced += Number(inv.totalAmount);

            if (inv.status === "Paid") {
                stmt.totalPaid += Number(inv.totalAmount);
            } else {
                stmt.balance += Number(inv.totalAmount);
            }
        });

        const statements = Array.from(statementMap.values()).sort((a, b) =>
            b.period.localeCompare(a.period)
        );

        res.json(statements);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch statements" });
    }
});

/**
 * POST /disputes
 * Create invoice dispute with file attachments
 */
router.post("/disputes", requirePortalAuth, uploadDisputeFiles, async (req: any, res) => {
    try {
        const { invoiceId, disputeReason, disputedAmount, description } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!invoiceId || !disputeReason) {
            return res.status(400).json({ message: "Invoice ID and dispute reason required" });
        }

        // Verify invoice belongs to customer
        const invoice = await arService.getInvoice(invoiceId);
        if (!invoice || invoice.customerId !== req.portalCustomerId) {
            return res.status(403).json({ message: "Invalid invoice" });
        }

        // Create dispute in database
        const [dispute] = await db.insert(arDisputes).values({
            invoiceId,
            customerId: req.portalCustomerId,
            disputeReason,
            disputedAmount: disputedAmount || invoice.totalAmount,
            description: description || null,
            status: "Open",
        }).returning();

        // Save file attachments if any
        if (files && files.length > 0) {
            const attachments = files.map((file) => ({
                disputeId: dispute.id,
                fileName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
            }));

            await db.insert(arDisputeAttachments).values(attachments);
        }

        // Trigger notification
        await notificationService.createNotification({
            customerId: req.portalCustomerId,
            type: "dispute_update",
            title: "Dispute Created",
            message: `Your dispute for invoice ${invoice.invoiceNumber} has been submitted and is under review.`,
            referenceId: dispute.id,
        });

        res.status(201).json({
            ...dispute,
            invoiceNumber: invoice.invoiceNumber,
            attachmentCount: files?.length || 0,
        });
    } catch (error: any) {
        console.error("Dispute Creation Error:", error);
        res.status(500).json({ message: error.message || "Failed to create dispute" });
    }
});

/**
 * GET /invoice/:id
 * Get invoice details with line items
 */
router.get("/invoice/:id", requirePortalAuth, async (req: any, res) => {
    try {
        const { id } = req.params;

        const invoice = await arService.getInvoice(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Verify ownership
        if (invoice.customerId !== req.portalCustomerId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Get line items
        const lineItems = await arService.getInvoiceLines(id);

        res.json({
            ...invoice,
            lineItems: lineItems.map(line => ({
                id: line.id,
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount,
                lineNumber: line.lineNumber
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch invoice details" });
    }
});

/**
 * GET /invoice/:id/pdf
 * Download invoice as PDF
 */
router.get("/invoice/:id/pdf", requirePortalAuth, async (req: any, res) => {
    try {
        const { id } = req.params;

        const invoice = await arService.getInvoice(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Verify ownership
        if (invoice.customerId !== req.portalCustomerId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateInvoicePDF(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ message: error.message || "Failed to generate PDF" });
    }
});

/**
 * GET /statements/:period/pdf
 * Download statement as PDF
 */
router.get("/statements/:period/pdf", requirePortalAuth, async (req: any, res) => {
    try {
        const { period } = req.params;

        // Generate PDF
        const pdfBuffer = await pdfGenerator.generateStatementPDF(req.portalCustomerId, period);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=statement-${period}.pdf`);
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ message: error.message || "Failed to generate PDF" });
    }
});

/**
 * GET /disputes
 * List all disputes for the authenticated customer
 */
router.get("/disputes", requirePortalAuth, async (req: any, res) => {
    try {
        const disputes = await db.select()
            .from(arDisputes)
            .where(eq(arDisputes.customerId, req.portalCustomerId))
            .orderBy(desc(arDisputes.createdAt));

        // Get attachment counts and invoice numbers for each dispute
        const disputesWithDetails = await Promise.all(
            disputes.map(async (dispute) => {
                const attachments = await db.select()
                    .from(arDisputeAttachments)
                    .where(eq(arDisputeAttachments.disputeId, dispute.id));

                const invoice = await arService.getInvoice(dispute.invoiceId);

                return {
                    ...dispute,
                    invoiceNumber: invoice?.invoiceNumber || "N/A",
                    attachmentCount: attachments.length,
                };
            })
        );

        res.json(disputesWithDetails);
    } catch (error) {
        console.error("Disputes List Error:", error);
        res.status(500).json({ message: "Failed to fetch disputes" });
    }
});

/**
 * GET /disputes/:disputeId/attachments
 * List attachments for a specific dispute
 */
router.get("/disputes/:disputeId/attachments", requirePortalAuth, async (req: any, res) => {
    try {
        const { disputeId } = req.params;

        // Verify dispute belongs to customer
        const [dispute] = await db.select()
            .from(arDisputes)
            .where(eq(arDisputes.id, disputeId))
            .limit(1);

        if (!dispute || dispute.customerId !== req.portalCustomerId) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        const attachments = await db.select()
            .from(arDisputeAttachments)
            .where(eq(arDisputeAttachments.disputeId, disputeId));

        res.json(attachments);
    } catch (error) {
        console.error("Attachments List Error:", error);
        res.status(500).json({ message: "Failed to fetch attachments" });
    }
});

/**
 * GET /disputes/:disputeId/attachments/:attachmentId
 * Download a specific attachment
 */
router.get("/disputes/:disputeId/attachments/:attachmentId", requirePortalAuth, async (req: any, res) => {
    try {
        const { disputeId, attachmentId } = req.params;

        const [dispute] = await db.select()
            .from(arDisputes)
            .where(eq(arDisputes.id, disputeId))
            .limit(1);

        if (!dispute || dispute.customerId !== req.portalCustomerId) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        const [attachment] = await db.select()
            .from(arDisputeAttachments)
            .where(eq(arDisputeAttachments.id, attachmentId))
            .limit(1);

        if (!attachment) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        res.download(attachment.filePath, attachment.fileName);
    } catch (error) {
        console.error("Attachment Download Error:", error);
        res.status(500).json({ message: "Failed to download attachment" });
    }
});

/**
 * GET /notifications
 * Get all notifications for the authenticated customer
 */
router.get("/notifications", requirePortalAuth, async (req: any, res) => {
    try {
        const notifications = await notificationService.getNotifications(req.portalCustomerId);
        res.json(notifications);
    } catch (error) {
        console.error("Notifications Error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});

/**
 * GET /notifications/unread
 * Get unread notification count
 */
router.get("/notifications/unread", requirePortalAuth, async (req: any, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.portalCustomerId);
        res.json({ count });
    } catch (error) {
        console.error("Unread Count Error:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
});

/**
 * POST /notifications/:id/mark-read
 * Mark a notification as read
 */
router.post("/notifications/:id/mark-read", requirePortalAuth, async (req: any, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
});

export default router;

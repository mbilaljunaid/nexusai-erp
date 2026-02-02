
import { Router } from "express";
import { dbStorage } from "../../storage-db"; // Direct DB storage
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { insertQuoteSchema, insertQuoteLineItemSchema, insertOrderSchema, quotes as quotesTable } from "@shared/schema";
import { z } from "zod";

const router = Router();

// --- QUOTES ---

// List Quotes (optional ?opportunityId query param)
router.get("/quotes", async (req, res) => {
    try {
        const opportunityId = req.query.opportunityId as string | undefined;
        const quotes = await dbStorage.listQuotes(opportunityId);
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Get Single Quote
router.get("/quotes/:id", async (req, res) => {
    try {
        const quote = await dbStorage.getQuote(req.params.id);
        if (!quote) return res.status(404).json({ error: "Quote not found" });
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Create Quote
router.post("/quotes", async (req, res) => {
    try {
        const data = insertQuoteSchema.parse(req.body);
        const quote = await dbStorage.createQuote(data);
        res.status(201).json(quote);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: String(error) });
        }
    }
});

// --- QUOTE LINE ITEMS ---

// List Line Items
router.get("/quotes/:id/line-items", async (req, res) => {
    try {
        const items = await dbStorage.listQuoteLineItems(req.params.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Add Line Item
router.post("/quotes/:id/line-items", async (req, res) => {
    try {
        const data = insertQuoteLineItemSchema.parse({
            ...req.body,
            quoteId: req.params.id
        });
        const item = await dbStorage.createQuoteLineItem(data);
        res.status(201).json(item);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: String(error) });
        }
    }
});

// SYNC FROM OPPORTUNITY
// Copies all Opportunity Line Items -> Quote Line Items
router.post("/quotes/:id/sync-opportunity", async (req, res) => {
    try {
        const quoteId = req.params.id;
        const { opportunityId } = req.body;

        if (!opportunityId) return res.status(400).json({ error: "opportunityId is required" });


        const opportunity = await dbStorage.getOpportunity(opportunityId);
        if (opportunity && opportunity.priceBookId) {
            // Update Quote with PriceBook ID
            await db.update(quotesTable).set({ priceBookId: opportunity.priceBookId }).where(eq(quotesTable.id, quoteId));
        }

        const oppItems = await dbStorage.listOpportunityLineItems(opportunityId);

        const createdItems = [];
        for (const item of oppItems) {
            const newItem = await dbStorage.createQuoteLineItem({
                quoteId: quoteId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                priceBookEntryId: item.priceBookEntryId,
                // Total price calculated by storage
            });
            createdItems.push(newItem);
        }

        res.json({ message: `Synced ${createdItems.length} items from Opportunity`, items: createdItems });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// GENERATE PDF (Placeholder)
router.post("/quotes/:id/generate-pdf", async (req, res) => {
    // In a real app, use pdfkit or puppeteer
    // For now, return a success message
    try {
        res.json({ message: "PDF generation triggered (Not implemented yet)", url: "/placeholder-pdf-url" });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

// --- APPROVAL WORKFLOW ---

// Submit for Approval / Presentation
router.post("/quotes/:id/submit", async (req, res) => {
    try {
        const quoteId = req.params.id;
        const userId = (req.user as any)?.id || "system"; // Mock user

        // Check Approval Rules
        // Import ApprovalService dynamically to avoid circular dep if any? No, should be fine.
        const { ApprovalService } = await import("../../services/ApprovalService");

        const check = await ApprovalService.checkQuoteApproval(quoteId, userId);

        if (check.required) {
            // Create Request
            await ApprovalService.createRequest("quote", quoteId, userId, "Discount exceeds 20% threshold");

            // Update Quote Status
            await db.update(quotesTable)
                .set({ status: "Pending Approval" })
                .where(eq(quotesTable.id, quoteId));

            res.json({ status: "Pending Approval", message: "Approval required due to high discount." });
        } else {
            // Auto Approve
            await db.update(quotesTable)
                .set({ status: "Presented" })
                .where(eq(quotesTable.id, quoteId));

            res.json({ status: "Presented", message: "Quote presented successfully." });
        }
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Approve Quote (Manager Action)
router.post("/quotes/:id/approve", async (req, res) => {
    try {
        const quoteId = req.params.id;
        // logic to find pending request and approve it
        await db.update(quotesTable)
            .set({ status: "Approved" })
            .where(eq(quotesTable.id, quoteId));
        res.json({ status: "Approved" });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});


// --- ORDERS ---
router.get("/orders", async (req, res) => {
    try {
        const orders = await dbStorage.listOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

router.post("/orders", async (req, res) => {
    try {
        const data = insertOrderSchema.parse(req.body);
        const order = await dbStorage.createOrder(data);
        res.status(201).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: String(error) });
        }
    }
});

export default router;

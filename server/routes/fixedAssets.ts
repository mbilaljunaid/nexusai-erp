
import { Router } from "express";
import { faService } from "../services/fixedAssets";
import { insertFaAssetSchema, insertFaBookSchema } from "@shared/schema";
import { z } from "zod";

export const fixedAssetsRouter = Router();

// Create Asset
fixedAssetsRouter.post("/assets", async (req, res) => {
    try {
        // Validation: Expect pure asset data or check complex input?
        // Phase 1 Service creates asset and transaction.
        // Frontend likely sends flattened asset data for now.
        const data = insertFaAssetSchema.parse(req.body);

        // For Phase 1, we might need to handle 'bookId' etc if not in body, 
        // but `insertFaAssetSchema` requires them.

        const result = await faService.createAsset(data);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// List Assets
fixedAssetsRouter.get("/assets", async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const assets = await faService.listAssets(
            limit ? Number(limit) : undefined,
            offset ? Number(offset) : undefined
        );
        const total = await faService.getAssetsCount();
        res.json({ data: assets, total });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Asset Stats
fixedAssetsRouter.get("/stats", async (req, res) => {
    try {
        const stats = await faService.getAssetsStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Retire Asset
fixedAssetsRouter.post("/assets/:id/retire", async (req, res) => {
    try {
        const schema = z.object({
            bookId: z.string(),
            retirementDate: z.coerce.date(),
            proceeds: z.number(),
            removalCost: z.number(),
            periodName: z.string().optional()
        });
        const data = schema.parse(req.body);
        const result = await faService.retireAsset(req.params.id, data);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// Transfer Asset
fixedAssetsRouter.post("/assets/:id/transfer", async (req, res) => {
    try {
        const schema = z.object({
            toLocationId: z.string().optional(),
            toCcid: z.string().optional(),
            description: z.string().optional(),
            transactionDate: z.coerce.date().optional(),
            createdBy: z.string().optional()
        });
        const data = schema.parse(req.body);
        // We need the asset book ID. For now we assume the ID passed is assetBookId or we resolve it?
        // faService.transferAsset takes assetBookId. 
        // But the route is /assets/:id/transfer usually implies assetId.
        // faService.transferAsset(assetBookId, ...)

        // Let's assume for the UI we are operating on the Asset Book Record ID if we are in a book context, 
        // OR we fetch the book record from the asset ID.
        // faService.listAssets returns asset objects where id is faAssets.id.
        // We need to resolve faAssetBooks.id from assetId (+ default book).

        // Quick fix: Retrieve the asset book for CORP-BOOK-1 (Default) if only assetId is known
        const { db } = await import("../db");
        const { faAssetBooks } = await import("@shared/schema");
        const { eq, and } = await import("drizzle-orm");

        const [ab] = await db.select().from(faAssetBooks).where(and(
            eq(faAssetBooks.assetId, req.params.id),
            eq(faAssetBooks.bookId, "CORP-BOOK-1") // Default
        ));

        if (!ab) throw new Error("Asset Book record not found for Default Book");

        const result = await faService.transferAsset(ab.id, data);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// Mass Additions - Prepare (Scan)
fixedAssetsRouter.post("/mass-additions/prepare", async (req, res) => {
    try {
        const result = await faService.prepareMassAdditions();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Mass Additions - List
fixedAssetsRouter.get("/mass-additions", async (req, res) => {
    try {
        const { db } = await import("../db");
        const { faMassAdditions } = await import("@shared/schema");
        const results = await db.select().from(faMassAdditions);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Mass Additions - Post
fixedAssetsRouter.post("/mass-additions/:id/post", async (req, res) => {
    try {
        const schema = z.object({
            bookId: z.string(),
            categoryId: z.string(),
            assetNumber: z.string()
        });
        const data = schema.parse(req.body);
        const result = await faService.postMassAddition(req.params.id, data);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// Run Depreciation
fixedAssetsRouter.post("/depreciation/run", async (req, res) => {
    try {
        const schema = z.object({
            bookId: z.string(),
            periodName: z.string(),
            periodEndDate: z.coerce.date()
        });
        const { bookId, periodName, periodEndDate } = schema.parse(req.body);

        const result = await faService.runDepreciation(bookId, periodName, periodEndDate);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// Roll Forward Report
fixedAssetsRouter.get("/reports/roll-forward", async (req, res) => {
    try {
        const { bookId, periodName } = req.query;
        if (!bookId || !periodName) {
            return res.status(400).json({ error: "bookId and periodName are required" });
        }
        const result = await faService.getRollForwardReport(String(bookId), String(periodName));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

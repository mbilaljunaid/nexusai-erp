
import { Router } from "express";
import { faService } from "../services/fixedAssets";
import { insertFaAssetSchema } from "@shared/schema";
import { z } from "zod";

const fixedAssetsRouter = Router();

// Create Asset
fixedAssetsRouter.post("/assets", async (req, res) => {
    try {
        const data = insertFaAssetSchema.parse(req.body);
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
        const ledgerId = req.headers['x-ledger-id'] as string | undefined;
        const assets = await faService.listAssets(
            limit ? Number(limit) : undefined,
            offset ? Number(offset) : undefined,
            ledgerId
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
        const ledgerId = req.headers['x-ledger-id'] as string | undefined;
        const stats = await faService.getAssetsStats(ledgerId);
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
        const { eq } = await import("drizzle-orm");
        const legalEntityId = req.headers['x-legal-entity-id'] as string | undefined;
        let results;
        if (legalEntityId) {
            results = await db.select().from(faMassAdditions)
                .where(eq(faMassAdditions.entLegalEntityId, legalEntityId));
        } else {
            results = await db.select().from(faMassAdditions);
        }
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

// Create Asset From Lease (ROU)
fixedAssetsRouter.post("/assets/from-lease", async (req, res) => {
    try {
        const { leaseId, cost, description, usefulLife } = req.body;
        const legalEntityId = req.headers['x-legal-entity-id'] as string | undefined;

        // Validate
        if (!leaseId || !cost) {
            return res.status(400).json({ error: "Missing leaseId or cost" });
        }

        const { db } = await import("../db");
        const { assets } = await import("@shared/schema");

        const newAsset: Record<string, any> = {
            assetNumber: `ROU-${Date.now()}`,
            name: description || "ROU Asset from Lease",
            description: `ROU Asset for Lease ${leaseId}`,
            cost: cost.toString(),
            usefulLifeMonths: usefulLife || 36,
            status: "ACTIVE",
            categoryId: "ROU-Lease",
            depreciationMethod: "STRAIGHT_LINE",
            acquisitionDate: new Date(),
            inServiceDate: new Date(),
            locationId: "HEADQUARTERS",
            salvageValue: "0",
            departmentId: "FINANCE"
        };

        if (legalEntityId) {
            newAsset.entLegalEntityId = legalEntityId;
        }

        const [asset] = await db.insert(assets).values(newAsset).returning();
        res.json(asset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export { fixedAssetsRouter };

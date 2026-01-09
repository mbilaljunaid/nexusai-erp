
import { Router } from "express";
import { fixedAssetsService } from "../services/fixedAssets";
import { insertFaAdditionSchema, insertFaBookSchema } from "@shared/schema";
import { z } from "zod";

export const fixedAssetsRouter = Router();

// Create Asset
fixedAssetsRouter.post("/assets", async (req, res) => {
    try {
        // Frontend sends { asset: ..., book: ... }
        const schema = z.object({
            asset: insertFaAdditionSchema,
            book: insertFaBookSchema.omit({ assetId: true }) // assetId is generated
        });

        const data = schema.parse(req.body);
        const result = await fixedAssetsService.createAsset(data.asset, data.book);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

// List Assets
fixedAssetsRouter.get("/assets", async (req, res) => {
    const assets = await fixedAssetsService.listAssets();
    res.json(assets);
});

// Get Asset Detail
fixedAssetsRouter.get("/assets/:id", async (req, res) => {
    const result = await fixedAssetsService.getAssetDetail(req.params.id);
    if (!result) return res.status(404).json({ error: "Asset not found" });
    res.json(result);
});

// Run Depreciation
fixedAssetsRouter.post("/depreciation/run", async (req, res) => {
    try {
        const schema = z.object({
            bookTypeCode: z.string(),
            periodName: z.string()
        });
        const { bookTypeCode, periodName } = schema.parse(req.body);

        const result = await fixedAssetsService.runDepreciation(bookTypeCode, periodName);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: String(error) });
    }
});

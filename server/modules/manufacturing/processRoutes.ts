import { Express } from "express";
import { manufacturingProcessService } from "../../services/ManufacturingProcessService";
import { db } from "../../db";
import { formulas, recipes, manufacturingBatches } from "../../../shared/schema/manufacturing";
import { eq, sql } from "drizzle-orm";

export function registerManufacturingProcessRoutes(app: Express) {
    // --- FORMULAS ---
    app.get("/api/manufacturing/formulas", async (req, res) => {
        try {
            const allFormulas = await db.query.formulas.findMany();
            res.json(allFormulas);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/formulas", async (req, res) => {
        try {
            const [newFormula] = await db.insert(formulas).values(req.body).returning();
            res.json(newFormula);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // --- RECIPES ---
    app.get("/api/manufacturing/recipes", async (req, res) => {
        try {
            const allRecipes = await db.query.recipes.findMany();
            res.json(allRecipes);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/recipes", async (req, res) => {
        try {
            const [newRecipe] = await db.insert(recipes).values(req.body).returning();
            res.json(newRecipe);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // --- BATCHES ---
    app.get("/api/manufacturing/batches", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = parseInt(req.query.offset as string) || 0;

            const items = await db.query.manufacturingBatches.findMany({
                limit,
                offset,
                orderBy: (batches, { desc }) => [desc(batches.createdAt)]
            });

            const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(manufacturingBatches);
            res.json({ items, total: Number(countResult.count) });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/manufacturing/batches/genealogy", async (req, res) => {
        try {
            const lotNumber = req.query.lotNumber as string;
            if (!lotNumber) return res.status(400).json({ error: "Lot number is required" });
            const result = await manufacturingProcessService.getBatchGenealogy(lotNumber);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/batches/release", async (req, res) => {
        try {
            const { recipeId, quantity } = req.body;
            const batch = await manufacturingProcessService.releaseBatch(recipeId, quantity);
            res.json(batch);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/batches/:id/yield", async (req, res) => {
        try {
            const { productId, quantity, type } = req.body;
            await manufacturingProcessService.recordYield(req.params.id, productId, quantity, type);
            res.sendStatus(200);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/batches/:id/close", async (req, res) => {
        try {
            const result = await manufacturingProcessService.closeBatch(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // --- QUALITY (LIMS) ---
    app.get("/api/manufacturing/quality-results/:inspectionId", async (req, res) => {
        try {
            const results = await manufacturingProcessService.getQualityResults(req.params.inspectionId);
            res.json(results);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/manufacturing/quality-results/:inspectionId", async (req, res) => {
        try {
            await manufacturingProcessService.saveQualityResults(req.params.inspectionId, req.body);
            res.sendStatus(201);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
}


import { Router } from "express";
import { db } from "../db";
import { ppmProjects, ppmTasks, ppmExpenditureItems } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { PpmService } from "../services/PpmService";

export const ppmRouter = Router();
const ppmService = new PpmService();

// List all projects
ppmRouter.get("/projects", async (req, res) => {
    try {
        const projects = await db.select().from(ppmProjects);
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get financial summary for all projects
ppmRouter.get("/summary", async (req, res) => {
    try {
        const result = await db.select({
            totalBudget: sql<string>`sum(budget)`,
            projectCount: sql<number>`count(*)`,
            totalRawCost: sql<string>`(
                select sum(raw_cost) from ppm_expenditure_items
            )`,
            totalBurdenedCost: sql<string>`(
                select sum(COALESCE(burdened_cost, raw_cost)) from ppm_expenditure_items
            )`
        }).from(ppmProjects);

        res.json(result[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get project detail with performance
ppmRouter.get("/projects/:id", async (req, res) => {
    try {
        const [project] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, req.params.id));
        if (!project) return res.status(404).json({ error: "Project not found" });

        const perf = await ppmService.getProjectPerformance(project.id);
        res.json({ ...project, performance: perf });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List tasks for a project
ppmRouter.get("/projects/:id/tasks", async (req, res) => {
    try {
        const tasks = await db.select()
            .from(ppmTasks)
            .where(eq(ppmTasks.projectId, req.params.id));
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get EVM performance metrics for a specific project
ppmRouter.get("/projects/:id/performance", async (req, res) => {
    try {
        const perf = await ppmService.getProjectPerformance(req.params.id);
        res.json(perf);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get paginated expenditure items
ppmRouter.get("/expenditures", async (req, res) => {
    try {
        const page = parseInt(req.query.page as string || "1");
        const limit = parseInt(req.query.limit as string || "20");
        const projectId = req.query.projectId as string | undefined;

        const results = await ppmService.getExpenditureItems(page, limit, projectId);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get expenditure types
ppmRouter.get("/expenditure-types", async (req, res) => {
    try {
        const types = await ppmService.getExpenditureTypes();
        res.json(types);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create expenditure type
ppmRouter.post("/expenditure-types", async (req, res) => {
    try {
        const { name, unitOfMeasure, description } = req.body;
        const type = await ppmService.createExpenditureType(name, unitOfMeasure, description);
        res.json(type);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get burden schedules
ppmRouter.get("/burden-schedules", async (req, res) => {
    try {
        const schedules = await ppmService.getBurdenSchedules();
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get project assets
ppmRouter.get("/assets", async (req, res) => {
    try {
        const projectId = req.query.projectId as string | undefined;
        const assets = await ppmService.getProjectAssets(projectId);
        res.json(assets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get SLA cost distributions
ppmRouter.get("/sla/distributions", async (req, res) => {
    try {
        const projectId = req.query.projectId as string | undefined;
        const expenditureItemId = req.query.expenditureItemId as string | undefined;

        const distributions = await ppmService.getCostDistributions(projectId, expenditureItemId);
        res.json(distributions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get pending transactions for import
ppmRouter.get("/transactions/pending", async (req, res) => {
    try {
        const transactions = await ppmService.getPendingTransactions();
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Trigger import of pending transactions
ppmRouter.post("/transactions/import", async (req, res) => {
    try {
        const results = await ppmService.collectFromAP();
        // Future: also call collectFromInventory, collectFromLabor
        res.json({ message: "Import completed", count: results.length, items: results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

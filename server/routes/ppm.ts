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

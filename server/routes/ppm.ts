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

// Bill Rate Schedules & Rates
ppmRouter.get("/bill-rate-schedules", async (req, res) => {
    try {
        const schedules = await ppmService.getBillRateSchedules();
        res.json(schedules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.post("/bill-rate-schedules", async (req, res) => {
    try {
        const schedule = await ppmService.createBillRateSchedule(req.body);
        res.json(schedule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.get("/bill-rate-schedules/:id/rates", async (req, res) => {
    try {
        const rates = await ppmService.getBillRates(req.params.id);
        res.json(rates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.post("/bill-rates", async (req, res) => {
    try {
        const rate = await ppmService.addBillRate(req.body);
        res.json(rate);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Project Templates
ppmRouter.get("/project-templates", async (req, res) => {
    try {
        const templates = await ppmService.getProjectTemplates();
        res.json(templates);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.post("/project-templates", async (req, res) => {
    try {
        const template = await ppmService.createProjectTemplate(req.body);
        res.json(template);
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
        const limit = parseInt(req.query.limit as string || "20");
        const offset = parseInt(req.query.offset as string || "0");
        const result = await ppmService.getProjectAssets(projectId, limit, offset);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get SLA cost distributions
ppmRouter.get("/sla/distributions", async (req, res) => {
    try {
        const projectId = req.query.projectId as string | undefined;
        const expenditureItemId = req.query.expenditureItemId as string | undefined;
        const limit = parseInt(req.query.limit as string || "20");
        const offset = parseInt(req.query.offset as string || "0");

        const result = await ppmService.getCostDistributions(projectId, expenditureItemId, limit, offset);
        res.json(result);
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
        // Collect from all sources (AUDIT-FIN-005)
        const apResults = await ppmService.collectFromAP();
        const invResults = await ppmService.collectFromInventory();
        const laborResults = await ppmService.collectFromLabor();

        const totalItems = apResults.length + invResults.length + laborResults.length;

        res.json({
            message: "Import completed",
            count: totalItems,
            details: {
                ap: apResults.length,
                inventory: invResults.length,
                labor: laborResults.length
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Billing Rules
ppmRouter.get("/projects/:id/billing-rules", async (req, res) => {
    try {
        const rules = await ppmService.getBillingRules(req.params.id);
        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.post("/billing-rules", async (req, res) => {
    try {
        const rule = await ppmService.createBillingRule(req.body);
        res.json(rule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

ppmRouter.delete("/billing-rules/:id", async (req, res) => {
    try {
        await ppmService.deleteBillingRule(req.params.id);
        res.json({ message: "Deleted" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

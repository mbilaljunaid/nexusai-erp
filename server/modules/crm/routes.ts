import { Express, Request, Response } from "express";
import { dbStorage } from "../../storage-db";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export function registerCrmRoutes(app: Express) {
    // CRM metrics
    app.get("/api/crm/metrics", async (req, res) => {
        try {
            const leads = await dbStorage.listLeads();
            const opportunities = await dbStorage.listOpportunities();

            const pipelineValue = opportunities.reduce((acc, opp) => acc + Number(opp.amount), 0);
            const wonOpportunities = opportunities.filter(opp => opp.stage === "closed-won");
            const winRate = opportunities.length > 0
                ? Math.round((wonOpportunities.length / opportunities.length) * 100)
                : 0;

            // Mock sales cycle for now
            const avgSalesCycle = "18 days";

            res.json({
                totalLeads: leads.length,
                pipelineValue: `$${(pipelineValue / 1000000).toFixed(1)}M`, // Format as millions
                winRate: `${winRate}%`,
                avgSalesCycle,
            });
        } catch (error) {
            console.error("Failed to fetch CRM metrics:", error);
            // Return fallback data on error
            res.json({
                totalLeads: 0,
                pipelineValue: "$0M",
                winRate: "0%",
                avgSalesCycle: "0 days",
            });
        }
    });

    // CRM opportunities
    app.get("/api/crm/opportunities", async (req, res) => {
        try {
            const opportunities = await dbStorage.listOpportunities();
            res.json(opportunities);
        } catch (error) {
            res.status(500).json({ error: "Failed to list opportunities" });
        }
    });

    app.post("/api/crm/opportunities", async (req, res) => {
        try {
            const { insertOpportunitySchema } = await import("../../../shared/schema");
            const parseResult = insertOpportunitySchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const opportunity = await dbStorage.createOpportunity(parseResult.data);
            res.status(201).json(opportunity);
        } catch (error) {
            console.error("Create opportunity error:", error);
            res.status(500).json({ error: "Failed to create opportunity" });
        }
    });

    // CRM Leads
    app.get("/api/leads", async (req, res) => {
        try {
            const leads = await dbStorage.listLeads();
            res.json(leads);
        } catch (error) {
            res.status(500).json({ error: "Failed to list leads" });
        }
    });

    app.post("/api/leads", async (req, res) => {
        try {
            const { insertLeadSchema } = await import("../../../shared/schema");
            const parseResult = insertLeadSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const lead = await dbStorage.createLead(parseResult.data);
            res.status(201).json(lead);
        } catch (error) {
            res.status(500).json({ error: "Failed to create lead" });
        }
    });
}

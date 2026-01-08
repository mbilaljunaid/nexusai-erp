import { Express, Request, Response } from "express";
import { dbStorage } from "../../storage-db";
import { db } from "../../db";
import { eq } from "drizzle-orm";

import { registerQuoteRoutes } from "./quotes-routes";
import { casesRoutes } from "./cases-routes"; // Added import for casesRoutes

export function registerCrmRoutes(app: Express) {
    registerQuoteRoutes(app); // New quotes module
    casesRoutes(app); // Register cases routes
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
                pipelineValue: `$${(pipelineValue / 1000000).toFixed(1)} M`, // Format as millions
                winRate: `${winRate}% `,
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
            console.error("Create lead failed:", error);
            res.status(500).json({ error: "Failed to create lead" });
        }
    });

    // CRM Lead Conversion
    app.post("/api/leads/:id/convert", async (req, res) => {
        try {
            const leadId = req.params.id;
            const result = await dbStorage.convertLead(leadId);
            res.json(result);
        } catch (error: any) {
            console.error("Lead conversion error:", error);
            res.status(500).json({ error: error.message || "Failed to convert lead" });
        }
    });

    // CRM Accounts
    app.get("/api/crm/accounts", async (req, res) => {
        try {
            const accounts = await dbStorage.listAccounts();
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: "Failed to list accounts" });
        }
    });

    app.post("/api/crm/accounts", async (req, res) => {
        try {
            const { insertAccountSchema } = await import("../../../shared/schema");
            const parseResult = insertAccountSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const account = await dbStorage.createAccount(parseResult.data);
            res.status(201).json(account);
        } catch (error) {
            console.error("Create account error:", error);
            res.status(500).json({ error: "Failed to create account" });
        }
    });

    // CRM Contacts
    app.get("/api/crm/contacts", async (req, res) => {
        try {
            const contacts = await dbStorage.listContacts();
            res.json(contacts);
        } catch (error) {
            res.status(500).json({ error: "Failed to list contacts" });
        }
    });

    app.post("/api/crm/contacts", async (req, res) => {
        try {
            const { insertContactSchema } = await import("../../../shared/schema");
            const parseResult = insertContactSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const contact = await dbStorage.createContact(parseResult.data);
            res.status(201).json(contact);
        } catch (error) {
            console.error("Create contact error:", error);
            res.status(500).json({ error: "Failed to create contact" });
        }
    });
    // CRM Interactions (Activities)
    app.get("/api/crm/interactions", async (req, res) => {
        try {
            const { entityType, entityId } = req.query;
            if (!entityType || !entityId) {
                return res.status(400).json({ error: "entityType and entityId are required" });
            }
            const interactions = await dbStorage.listInteractions(String(entityType), String(entityId));
            res.json(interactions);
        } catch (error) {
            res.status(500).json({ error: "Failed to list interactions" });
        }
    });

    app.post("/api/crm/interactions", async (req, res) => {
        try {
            const { insertInteractionSchema } = await import("../../../shared/schema");
            const parseResult = insertInteractionSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const interaction = await dbStorage.createInteraction(parseResult.data);
            res.status(201).json(interaction);
        } catch (error) {
            console.error("Create interaction error:", error);
            res.status(500).json({ error: "Failed to create interaction" });
        }
    });


    // CRM Campaigns
    app.get("/api/crm/campaigns", async (req, res) => {
        try {
            const campaigns = await dbStorage.listCampaigns();
            res.json(campaigns);
        } catch (error) {
            res.status(500).json({ error: "Failed to list campaigns" });
        }
    });

    app.post("/api/crm/campaigns", async (req, res) => {
        try {
            const { insertCampaignSchema } = await import("../../../shared/schema");
            const parseResult = insertCampaignSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const campaign = await dbStorage.createCampaign(parseResult.data);
            res.status(201).json(campaign);
        } catch (error) {
            console.error("Create campaign error:", error);
            res.status(500).json({ error: "Failed to create campaign" });
        }
    });

    app.put("/api/crm/campaigns/:id", async (req, res) => {
        try {
            const { insertCampaignSchema } = await import("../../../shared/schema");
            const parseResult = insertCampaignSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const campaign = await dbStorage.updateCampaign(req.params.id, parseResult.data);
            res.json(campaign);
        } catch (error) {
            console.error("Update campaign error:", error);
            res.status(500).json({ error: "Failed to update campaign" });
        }
    });

    app.delete("/api/crm/campaigns/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const success = await dbStorage.deleteCampaign(id);
            if (!success) {
                return res.status(404).json({ error: "Campaign not found" });
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Delete campaign error:", error);
            res.status(500).json({ error: "Failed to delete campaign" });
        }
    });

    // --- Products ---
    app.get("/api/crm/products", async (req, res) => {
        try {
            const products = await dbStorage.listProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: "Failed to list products" });
        }
    });

    app.post("/api/crm/products", async (req, res) => {
        try {
            const { insertProductSchema } = await import("../../../shared/schema");
            const parseResult = insertProductSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const product = await dbStorage.createProduct(parseResult.data);
            res.status(201).json(product);
        } catch (error) {
            console.error("Create product error:", error);
            res.status(500).json({ error: "Failed to create product" });
        }
    });

    // --- Price Books ---
    app.get("/api/crm/price-books", async (req, res) => {
        try {
            const priceBooks = await dbStorage.listPriceBooks();
            res.json(priceBooks);
        } catch (error) {
            res.status(500).json({ error: "Failed to list price books" });
        }
    });

    app.post("/api/crm/price-books", async (req, res) => {
        try {
            const { insertPriceBookSchema } = await import("../../../shared/schema");
            const parseResult = insertPriceBookSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const pb = await dbStorage.createPriceBook(parseResult.data);
            res.status(201).json(pb);
        } catch (error) {
            console.error("Create price book error:", error);
            res.status(500).json({ error: "Failed to create price book" });
        }
    });

    // --- Opportunity Line Items ---
    app.get("/api/crm/opportunities/:id/line-items", async (req, res) => {
        try {
            const { id } = req.params;
            const items = await dbStorage.listOpportunityLineItems(id);
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: "Failed to list line items" });
        }
    });

    app.post("/api/crm/opportunities/:id/line-items", async (req, res) => {
        try {
            const { insertLineItemSchema } = await import("../../../shared/schema");
            const parseResult = insertLineItemSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const item = await dbStorage.createOpportunityLineItem(parseResult.data);
            res.status(201).json(item);
        } catch (error) {
            console.error("Create line item error:", error);
            res.status(500).json({ error: "Failed to create line item" });
        }
    });

    app.delete("/api/crm/opportunities/:id/line-items/:itemId", async (req, res) => {
        try {
            const { itemId } = req.params;
            const success = await dbStorage.deleteOpportunityLineItem(itemId);
            if (!success) {
                return res.status(404).json({ error: "Line item not found" });
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Delete line item error:", error);
            res.status(500).json({ error: "Failed to delete line item" });
        }
    });
}

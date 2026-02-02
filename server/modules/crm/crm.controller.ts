import { Request, Response } from "express";
import { crmService } from "./CrmService";

export class CrmController {

    // ========== DASHBOARD METRICS ==========

    async getMetrics(req: Request, res: Response) {
        try {
            const scope = req.query.scope as string || 'all';
            const userId = (req.user as any)?.id || 1; // Default to 1 for dev/test

            const metrics = await crmService.getDashboardMetrics(userId, scope);
            res.json(metrics);
        } catch (error: any) {
            console.error("Failed to fetch CRM metrics:", error);
            res.status(500).json({ error: "Failed to fetch CRM metrics" });
        }
    }

    // ========== OPPORTUNITIES ==========

    async getOpportunities(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            const accountId = req.query.accountId as string;

            const result = await crmService.getOpportunities({ page, limit, search, accountId });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to list opportunities" });
        }
    }

    async createOpportunity(req: Request, res: Response) {
        try {
            // Schemas should ideally be imported here for validation, or middleware used
            const { insertOpportunitySchema } = await import("@shared/schema");
            const parseResult = insertOpportunitySchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }

            const opportunity = await crmService.createOpportunity(parseResult.data);
            res.status(201).json(opportunity);
        } catch (error) {
            console.error("Create opportunity error:", error);
            res.status(500).json({ error: "Failed to create opportunity" });
        }
    }

    async updateOpportunity(req: Request, res: Response) {
        try {
            const { insertOpportunitySchema } = await import("@shared/schema");
            const parseResult = insertOpportunitySchema.partial().safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }

            const opportunity = await crmService.updateOpportunity(req.params.id, parseResult.data);
            if (!opportunity) return res.status(404).json({ error: "Opportunity not found" });
            res.json(opportunity);
        } catch (error) {
            console.error("Update opportunity error:", error);
            res.status(500).json({ error: "Failed to update opportunity" });
        }
    }

    async analyzeOpportunity(req: Request, res: Response) {
        try {
            const result = await crmService.analyzeOpportunity(req.params.id);
            res.json(result);
        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            res.status(500).json({ error: error.message });
        }
    }

    // ========== LEADS ==========

    async getLeads(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;

            const result = await crmService.getLeads({ page, limit, search });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to list leads" });
        }
    }

    async getLeadById(req: Request, res: Response) {
        try {
            const lead = await crmService.getLeadById(req.params.id);
            if (!lead) return res.status(404).json({ error: "Lead not found" });
            res.json(lead);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch lead" });
        }
    }

    async createLead(req: Request, res: Response) {
        try {
            const { insertLeadSchema } = await import("@shared/schema");
            const parseResult = insertLeadSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }

            const lead = await crmService.createLead(parseResult.data);
            res.status(201).json(lead);
        } catch (error) {
            console.error("Create lead failed:", error);
            res.status(500).json({ error: "Failed to create lead" });
        }
    }

    async convertLead(req: Request, res: Response) {
        try {
            const result = await crmService.convertLead(req.params.id);
            res.json(result);
        } catch (error: any) {
            console.error("Lead conversion error:", error);
            res.status(500).json({ error: error.message || "Failed to convert lead" });
        }
    }

    // ========== CAMPAIGNS ==========

    async getCampaigns(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await crmService.getCampaigns({ page, limit });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to list campaigns" });
        }
    }

    async createCampaign(req: Request, res: Response) {
        try {
            const { insertCampaignSchema } = await import("@shared/schema");
            const parseResult = insertCampaignSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const campaign = await crmService.createCampaign(parseResult.data);
            res.status(201).json(campaign);
        } catch (error) {
            console.error("Create campaign error:", error);
            res.status(500).json({ error: "Failed to create campaign" });
        }
    }

    async updateCampaign(req: Request, res: Response) {
        try {
            const { insertCampaignSchema } = await import("@shared/schema");
            const parseResult = insertCampaignSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const campaign = await crmService.updateCampaign(req.params.id, parseResult.data);
            res.json(campaign);
        } catch (error) {
            console.error("Update campaign error:", error);
            res.status(500).json({ error: "Failed to update campaign" });
        }
    }

    async deleteCampaign(req: Request, res: Response) {
        try {
            const success = await crmService.deleteCampaign(req.params.id);
            if (!success) return res.status(404).json({ error: "Campaign not found" });
            res.json({ success: true });
        } catch (error) {
            console.error("Delete campaign error:", error);
            res.status(500).json({ error: "Failed to delete campaign" });
        }
    }

    // ========== PRODUCTS ==========

    async getProducts(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;

            const result = await crmService.getProducts({ page, limit, search });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to list products" });
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const { insertProductSchema } = await import("@shared/schema");
            const parseResult = insertProductSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const product = await crmService.createProduct(parseResult.data);
            res.status(201).json(product);
        } catch (error) {
            console.error("Create product error:", error);
            res.status(500).json({ error: "Failed to create product" });
        }
    }

    // ========== INTERACTIONS ==========

    async getInteractions(req: Request, res: Response) {
        try {
            const { entityType, entityId } = req.query;
            if (!entityType || !entityId) {
                return res.status(400).json({ error: "entityType and entityId are required" });
            }
            const interactions = await crmService.getInteractions(String(entityType), String(entityId));
            res.json(interactions);
        } catch (error) {
            res.status(500).json({ error: "Failed to list interactions" });
        }
    }

    async createInteraction(req: Request, res: Response) {
        try {
            const { insertInteractionSchema } = await import("@shared/schema");
            const parseResult = insertInteractionSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const interaction = await crmService.createInteraction(parseResult.data);
            res.status(201).json(interaction);
        } catch (error) {
            console.error("Create interaction error:", error);
            res.status(500).json({ error: "Failed to create interaction" });
        }
    }
    // ========== PRICE BOOKS ==========

    async createPriceBook(req: Request, res: Response) {
        try {
            const { insertPriceBookSchema } = await import("@shared/schema");
            const parseResult = insertPriceBookSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const pb = await crmService.createPriceBook(parseResult.data);
            res.status(201).json(pb);
        } catch (error) {
            console.error("Create price book error:", error);
            res.status(500).json({ error: "Failed to create price book" });
        }
    }

    // ========== OPPORTUNITY LINE ITEMS ==========

    async getLineItems(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const items = await crmService.listOpportunityLineItems(id);
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: "Failed to list line items" });
        }
    }

    async createLineItem(req: Request, res: Response) {
        try {
            const { insertLineItemSchema } = await import("@shared/schema");
            const parseResult = insertLineItemSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const item = await crmService.createOpportunityLineItem(parseResult.data);
            res.status(201).json(item);
        } catch (error) {
            console.error("Create line item error:", error);
            res.status(500).json({ error: "Failed to create line item" });
        }
    }

    async deleteLineItem(req: Request, res: Response) {
        try {
            const { itemId } = req.params;
            const success = await crmService.deleteOpportunityLineItem(itemId);
            if (!success) {
                return res.status(404).json({ error: "Line item not found" });
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Delete line item error:", error);
            res.status(500).json({ error: "Failed to delete line item" });
        }
    }

    // ========== CONTACTS ==========

    async getContacts(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;

            const result = await crmService.getContacts({ page, limit, search });
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to list contacts" });
        }
    }

    async getContactById(req: Request, res: Response) {
        try {
            const contact = await crmService.getContactById(req.params.id);
            if (!contact) return res.status(404).json({ error: "Contact not found" });
            res.json(contact);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch contact" });
        }
    }

    async createContact(req: Request, res: Response) {
        try {
            const { insertContactSchema } = await import("@shared/schema");
            const parseResult = insertContactSchema.safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const contact = await crmService.createContact(parseResult.data);
            res.status(201).json(contact);
        } catch (error) {
            console.error("Create contact error:", error);
            res.status(500).json({ error: "Failed to create contact" });
        }
    }

    async updateContact(req: Request, res: Response) {
        try {
            const { insertContactSchema } = await import("@shared/schema");
            const parseResult = insertContactSchema.partial().safeParse(req.body);

            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const contact = await crmService.updateContact(req.params.id, parseResult.data);
            res.json(contact);
        } catch (error) {
            console.error("Update contact error:", error);
            res.status(500).json({ error: "Failed to update contact" });
        }
    }

    async deleteContact(req: Request, res: Response) {
        try {
            await crmService.deleteContact(req.params.id);
            res.json({ success: true });
        } catch (error) {
            console.error("Delete contact error:", error);
            res.status(500).json({ error: "Failed to delete contact" });
        }
    }
}

export const crmController = new CrmController();

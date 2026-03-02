import { Router } from "express";
import { opportunityService } from "../services/OpportunityService";
import { quoteService } from "../services/QuoteService";
import { productService } from "../services/ProductCatalogService";
import { caseManagementService } from "../services/CaseService";
import { leadService } from "../services/LeadService";
import { campaignService } from "../services/CampaignService";
import { partnerService } from "../services/PartnerService";

export const crmRouter = Router();

// ============================================
// OPPORTUNITY ENDPOINTS
// ============================================

// Get all opportunities
crmRouter.get("/opportunities", async (req, res) => {
    try {
        const { stage, owner, minAmount, maxAmount } = req.query;
        const tenantId = req.user?.tenantId;
        const buId = req.headers["x-business-unit-id"] as string | undefined;

        const opportunities = await opportunityService.getAll({
            tenantId,
            buId,
            stage: stage as string,
            owner: owner as string,
            minAmount: minAmount ? Number(minAmount) : undefined,
            maxAmount: maxAmount ? Number(maxAmount) : undefined
        });

        res.json(opportunities);
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        res.status(500).json({ error: "Failed to fetch opportunities" });
    }
});

// Get opportunity by ID
crmRouter.get("/opportunities/:id", async (req, res) => {
    try {
        const opportunity = await opportunityService.getById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ error: "Opportunity not found" });
        }

        res.json(opportunity);
    } catch (error) {
        console.error("Error fetching opportunity:", error);
        res.status(500).json({ error: "Failed to fetch opportunity" });
    }
});

// Create opportunity
crmRouter.post("/opportunities", async (req, res) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        const payload = { ...req.body };
        if (buId) payload.entBusinessUnitId = buId;
        const opportunity = await opportunityService.create(payload);
        res.status(201).json(opportunity);
    } catch (error) {
        console.error("Error creating opportunity:", error);
        res.status(500).json({ error: "Failed to create opportunity" });
    }
});

// Update opportunity
crmRouter.patch("/opportunities/:id", async (req, res) => {
    try {
        const opportunity = await opportunityService.update(req.params.id, req.body);
        res.json(opportunity);
    } catch (error) {
        console.error("Error updating opportunity:", error);
        res.status(500).json({ error: "Failed to update opportunity" });
    }
});

// Move opportunity stage
crmRouter.patch("/opportunities/:id/stage", async (req, res) => {
    try {
        const { stage, probability } = req.body;
        const opportunity = await opportunityService.updateStage(req.params.id, stage, probability);
        res.json(opportunity);
    } catch (error) {
        console.error("Error updating stage:", error);
        res.status(500).json({ error: "Failed to update stage" });
    }
});

// Close opportunity as won
crmRouter.post("/opportunities/:id/close-won", async (req, res) => {
    try {
        const opportunity = await opportunityService.closeAsWon(req.params.id);
        res.json(opportunity);
    } catch (error) {
        console.error("Error closing opportunity:", error);
        res.status(500).json({ error: "Failed to close opportunity" });
    }
});

// Close opportunity as lost
crmRouter.post("/opportunities/:id/close-lost", async (req, res) => {
    try {
        const opportunity = await opportunityService.closeAsLost(req.params.id);
        res.json(opportunity);
    } catch (error) {
        console.error("Error closing opportunity:", error);
        res.status(500).json({ error: "Failed to close opportunity" });
    }
});

// Get pipeline stats
crmRouter.get("/opportunities/analytics/pipeline", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        const { owner } = req.query;

        const stats = await opportunityService.getPipelineStats({
            tenantId,
            buId,
            owner: owner as string
        });

        res.json(stats);
    } catch (error) {
        console.error("Error fetching pipeline stats:", error);
        res.status(500).json({ error: "Failed to fetch pipeline stats" });
    }
});

// ============================================
// QUOTE ENDPOINTS
// ============================================

// Get all quotes
crmRouter.get("/quotes", async (req, res) => {
    try {
        const { status, opportunityId } = req.query;
        const tenantId = req.user?.tenantId;
        const buId = req.headers["x-business-unit-id"] as string | undefined;

        const quotes = await quoteService.getAll({
            tenantId,
            buId,
            status: status as string,
            opportunityId: opportunityId as string
        });

        res.json(quotes);
    } catch (error) {
        console.error("Error fetching quotes:", error);
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
});

// Get quote by ID with line items
crmRouter.get("/quotes/:id", async (req, res) => {
    try {
        const result = await quoteService.getById(req.params.id);

        if (!result) {
            return res.status(404).json({ error: "Quote not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({ error: "Failed to fetch quote" });
    }
});

// Create quote
crmRouter.post("/quotes", async (req, res) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        const payload = { ...req.body };
        if (buId) payload.entBusinessUnitId = buId;
        const quote = await quoteService.create(payload);
        res.status(201).json(quote);
    } catch (error) {
        console.error("Error creating quote:", error);
        res.status(500).json({ error: "Failed to create quote" });
    }
});

// Update quote
crmRouter.patch("/quotes/:id", async (req, res) => {
    try {
        const quote = await quoteService.update(req.params.id, req.body);
        res.json(quote);
    } catch (error) {
        console.error("Error updating quote:", error);
        res.status(500).json({ error: "Failed to update quote" });
    }
});

// Approve quote
crmRouter.post("/quotes/:id/approve", async (req, res) => {
    try {
        const { approvedBy } = req.body;
        const quote = await quoteService.approve(req.params.id, approvedBy);
        res.json(quote);
    } catch (error) {
        console.error("Error approving quote:", error);
        res.status(500).json({ error: "Failed to approve quote" });
    }
});

// Reject quote
crmRouter.post("/quotes/:id/reject", async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const quote = await quoteService.reject(req.params.id, rejectionReason);
        res.json(quote);
    } catch (error) {
        console.error("Error rejecting quote:", error);
        res.status(500).json({ error: "Failed to reject quote" });
    }
});

// Add line item to quote
crmRouter.post("/quotes/:id/items", async (req, res) => {
    try {
        const item = await quoteService.addLineItem(req.params.id, req.body);
        res.status(201).json(item);
    } catch (error) {
        console.error("Error adding line item:", error);
        res.status(500).json({ error: "Failed to add line item" });
    }
});

// Update line item
crmRouter.patch("/quote-items/:id", async (req, res) => {
    try {
        const item = await quoteService.updateLineItem(req.params.id, req.body);
        res.json(item);
    } catch (error) {
        console.error("Error updating line item:", error);
        res.status(500).json({ error: "Failed to update line item" });
    }
});

// Remove line item
crmRouter.delete("/quote-items/:id", async (req, res) => {
    try {
        const success = await quoteService.removeLineItem(req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: "Line item not found" });
        }
    } catch (error) {
        console.error("Error removing line item:", error);
        res.status(500).json({ error: "Failed to remove line item" });
    }
});

// ============================================
// PRODUCT CATALOG ENDPOINTS
// ============================================

// Get all products
crmRouter.get("/products", async (req, res) => {
    try {
        const { category, status, search } = req.query;
        const tenantId = req.user?.tenantId;

        const products = await productService.getAllProducts({
            tenantId,
            category: category as string,
            status: status as string,
            search: search as string
        });

        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Get product by ID
crmRouter.get("/products/:id", async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

// Create product
crmRouter.post("/products", async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// Update product
crmRouter.patch("/products/:id", async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// ============================================
// CASE MANAGEMENT ENDPOINTS
// ============================================

// Get all cases
crmRouter.get("/cases", async (req, res) => {
    try {
        const { status, priority, assignedTo, slaStatus } = req.query;
        const tenantId = req.user?.tenantId;
        const buId = req.headers["x-business-unit-id"] as string | undefined;

        const cases = await caseManagementService.getAll({
            tenantId,
            buId,
            status: status as string,
            priority: priority as string,
            assignedTo: assignedTo as string,
            slaStatus: slaStatus as string
        });

        res.json(cases);
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ error: "Failed to fetch cases" });
    }
});

// Get case by ID
crmRouter.get("/cases/:id", async (req, res) => {
    try {
        const result = await caseManagementService.getById(req.params.id);

        if (!result) {
            return res.status(404).json({ error: "Case not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching case:", error);
        res.status(500).json({ error: "Failed to fetch case" });
    }
});

// Create case
crmRouter.post("/cases", async (req, res) => {
    try {
        const buId = req.headers["x-business-unit-id"] as string | undefined;
        const payload = { ...req.body };
        if (buId) payload.entBusinessUnitId = buId;
        const caseRecord = await caseManagementService.create(payload);
        res.status(201).json(caseRecord);
    } catch (error) {
        console.error("Error creating case:", error);
        res.status(500).json({ error: "Failed to create case" });
    }
});

// Update case
crmRouter.patch("/cases/:id", async (req, res) => {
    try {
        const caseRecord = await caseManagementService.update(req.params.id, req.body);
        res.json(caseRecord);
    } catch (error) {
        console.error("Error updating case:", error);
        res.status(500).json({ error: "Failed to update case" });
    }
});

// Resolve case
crmRouter.post("/cases/:id/resolve", async (req, res) => {
    try {
        const caseRecord = await caseManagementService.resolve(req.params.id);
        res.json(caseRecord);
    } catch (error) {
        console.error("Error resolving case:", error);
        res.status(500).json({ error: "Failed to resolve case" });
    }
});

// Escalate case
crmRouter.post("/cases/:id/escalate", async (req, res) => {
    try {
        const caseRecord = await caseManagementService.escalate(req.params.id);
        res.json(caseRecord);
    } catch (error) {
        console.error("Error escalating case:", error);
        res.status(500).json({ error: "Failed to escalate case" });
    }
});

// ============================================
// LEAD ENDPOINTS (leverage existing LeadService)
// ============================================

// Convert lead to opportunity/account/contact
crmRouter.post("/leads/:id/convert", async (req, res) => {
    try {
        const { ownerId } = req.body;
        const result = await leadService.convertLead(req.params.id, ownerId);
        res.json(result);
    } catch (error) {
        console.error("Error converting lead:", error);
        res.status(500).json({ error: "Failed to convert lead" });
    }
});

// Calculate lead score
crmRouter.post("/leads/calculate-score", async (req, res) => {
    try {
        const score = leadService.calculateLeadScore(req.body);
        res.json({ score });
    } catch (error) {
        console.error("Error calculating lead score:", error);
        res.status(500).json({ error: "Failed to calculate lead score" });
    }
});

export default crmRouter;

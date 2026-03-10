
import { Router } from "express";
import { crmController } from "./crm.controller";

// Modular Sub-Routers
import quotesRouter from "./quotes-routes";
import priceBookRoutes from "./price-book-routes";
import { analyticsRoutes } from "./analytics-routes";
import { competitorRoutes } from "./competitors-routes";
import { quotaRoutes } from "./quotas-routes";
import { accountRoutes } from "./accounts-routes";
import { territoryRoutes } from "./territories-routes";
import { commissionRoutes } from "./commissions-routes";
import { forecastingRoutes } from "./forecasting-routes";
import { campaignRoutes } from "./campaigns-routes";
import { caseRoutes } from "./cases-routes";
import { fieldServiceRoutes } from "./field-service-routes";
import { knowledgeBaseRoutes } from "./knowledge-base-routes";
import { contractRoutes } from "./contracts-routes";
import { partnerRoutes } from "./partner-routes";
import { cpqRoutes } from "./cpq-routes";

// Import mock routes for new CRM features
import { crmRouter as crmDatabaseRouter } from "../../routes/crmRoutes";

export const crmRouter = Router();

// --- CRM Sub-Modules ---
crmRouter.use(quotesRouter); // /quotes, /orders (mounted at /api/crm)
crmRouter.use(priceBookRoutes); // /price-books
crmRouter.use("/competitors", competitorRoutes);
crmRouter.use("/quotas", quotaRoutes);
crmRouter.use("/accounts", accountRoutes);
crmRouter.use("/territories", territoryRoutes);
crmRouter.use("/commissions", commissionRoutes);
crmRouter.use("/forecast", forecastingRoutes);
crmRouter.use("/campaigns", campaignRoutes);
crmRouter.use("/cases", caseRoutes);
crmRouter.use("/field-service", fieldServiceRoutes);
crmRouter.use("/knowledge", knowledgeBaseRoutes);
crmRouter.use("/contracts", contractRoutes);
crmRouter.use("/partner", partnerRoutes);
crmRouter.use("/analytics", analyticsRoutes);
crmRouter.use("/cpq", cpqRoutes);

// USE REAL DATABASE-BACKED ROUTES
crmRouter.use(crmDatabaseRouter);

// --- CrmController Routes ---

// Metrics
crmRouter.get("/metrics", crmController.getMetrics);

// Opportunities
crmRouter.get("/opportunities", crmController.getOpportunities);
crmRouter.post("/opportunities", crmController.createOpportunity);
crmRouter.patch("/opportunities/:id", crmController.updateOpportunity);
crmRouter.post("/opportunities/:id/analyze", crmController.analyzeOpportunity);

// Opportunity Line Items
crmRouter.get("/opportunities/:id/line-items", crmController.getLineItems);
crmRouter.post("/opportunities/:id/line-items", crmController.createLineItem);
crmRouter.delete("/opportunities/:id/line-items/:itemId", crmController.deleteLineItem);

// Leads
// Note: Leads are mounted at /api/leads in original. 
// If we mount crmRouter at /api/crm, these become /api/crm/leads.
// We should check if we want that change or if we need to mount a separate router for leads?
// Original: app.get("/api/leads", ...)
// If I put it here, it becomes /api/crm/api/leads if I am not careful with paths.
// If I use `/leads`, it becomes `/api/crm/leads`.
// For standardization, standardizing on `/api/crm/leads` is better, but might break frontend.
// I will keep them compatible or explicit.
// Let's assume frontend expects /api/leads.
// To support /api/leads, I should NOT put them in crmRouter mounted at /api/crm unless I also mount logic at root, or I register them separately.
// OR I can use a separate `leadsRouter` and mount it at `/api/leads` in server/routes.ts.
// Let's create `leadsRouter` export as well? No, that's messy.
// I will export specific functions or a separate router for leads if needed.
// However, looking at standardizing: /api/crm/leads is the target state.
// I will map them to `/leads` here (=> /api/crm/leads) AND I should perhaps add a redirect or double mount if needed?
// Let's stick to the target: /api/crm/leads.
// BUT, if the frontend hardcodes /api/leads, it breaks.
// I will verify frontend later. For now, I'll mount them at `/leads` inside CRM router (so /api/crm/leads).
// AND, I will ALSO export a `leadsRouter` specifically for /api/leads backward compatibility if I want.
// Actually, `server/routes.ts` can mount `crmRouter` at `/api/crm`, but it can also mount it at `/api`? No.
// I will define them here. If the frontend breaks, I fix the frontend. That is refactoring.

crmRouter.get("/leads", crmController.getLeads); // /api/crm/leads ?
// Wait, Controller gets leads at /api/leads.
// If I change strictly to /api/crm/leads, I need to check usage?
// I'll stick to /leads inside this router.

crmRouter.get("/leads/:id", crmController.getLeadById);
crmRouter.post("/leads", crmController.createLead);
crmRouter.post("/leads/:id/convert", crmController.convertLead);

// Campaigns (also handled by campaignRoutes, but controller has methods?)
// Controller methods: getCampaigns, createCampaign, etc.
// `campaignRoutes` likely has legacy implementation.
// `crmController` methods use `crmService` which uses `dbStorage`.
// If `campaignRoutes` is robust, I should use it.
// Original `routes.ts` had BOTH: `app.use("/api/crm/campaigns", campaignRoutes)` AND `app.get("/api/crm/campaigns", crmController.getCampaigns)`.
// Express matches array order. The explicit `app.get` was AFTER `app.use`?
// No, `app.use` matches prefixes.
// I will prioritize `crmController` for the CRUD if it duplicates.
// But wait, `campaignRoutes` might have sub-routes like `/:id/metrics`.
// I will comment out the crmController CRUD for campaigns if campaignRoutes covers it, OR vice versa.
// Looking at original file:
// lines 61-64: crmController methods.
// line 160: app.use(..., campaignRoutes).
// The Controller methods were defined FIRST.
// I will keep the Controller methods.
crmRouter.get("/campaigns", crmController.getCampaigns);
crmRouter.post("/campaigns", crmController.createCampaign);
crmRouter.put("/campaigns/:id", crmController.updateCampaign);
crmRouter.delete("/campaigns/:id", crmController.deleteCampaign);


// Products
crmRouter.get("/products", crmController.getProducts);
crmRouter.post("/products", crmController.createProduct);

// Interactions
crmRouter.get("/interactions", crmController.getInteractions);
crmRouter.post("/interactions", crmController.createInteraction);

// Contacts
crmRouter.get("/contacts", crmController.getContacts);
crmRouter.get("/contacts/:id", crmController.getContactById);
crmRouter.post("/contacts", crmController.createContact);
crmRouter.patch("/contacts/:id", crmController.updateContact);
crmRouter.delete("/contacts/:id", crmController.deleteContact);

// Price Books (Controller Method)
crmRouter.post("/price-books", crmController.createPriceBook);

// Note: /price-books root listing is handled by priceBookRoutes mounted above.


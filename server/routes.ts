import { type Express, Router } from "express";
import { createServer, type Server } from "http";
import { setupPlatformAuth, seedAdminUser } from "./platformAuth";
import { enforceRBAC } from "./middleware/auth";
import { storage } from "./storage";
import { slaRouter } from "./modules/sla/routes";

// Import modular routes
import { registerDashboardRoutes } from "./modules/dashboard/routes";
import { crmRouter } from "./modules/crm/routes";
import { registerFeedbackRoutes } from "./modules/feedback/routes";
import { copilotRouter } from "./modules/copilot/routes";
import { registerFinanceRoutes } from "./modules/finance/routes";
import { hrRouter } from "./modules/hr/routes";
import { registerProjectRoutes } from "./modules/project/routes";
import { scmRoutes } from "./modules/scm/routes";
import { scmController } from "./modules/scm/scm.controller"; // Import Controller
import { manufacturingRouter } from "./modules/manufacturing/routes";
import { registerPlatformRoutes } from "./modules/platform/routes";
import { registerMarketplaceRoutes } from "./modules/marketplace/routes";
import { registerCommunityRoutes } from "./modules/community/routes";
import { revenueRouter } from "./modules/revenue/routes";
import { maintenanceRouter } from "./modules/maintenance/routes";
import treasuryRouter from "./modules/treasury/routes";
import leaseDirectRouter from "./routes/lease";
import { registerNotificationRoutes } from "./modules/notifications/routes";
import contractRoutes from "./modules/contracts/routes";
import intercompanyRouter from "./routes/intercompany";
import hrAnalyticsRouter from "./routes/hr_analytics";
import hrPredictiveRouter from "./routes/hr_predictive";
import hrReportsRouter from "./routes/hr_reports";
import hrConfigurationRouter from "./routes/hr_configuration";


// Import existing routes files that were already modularized (if any)
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";

// import financeRouter from "./routes/finance";
import { apRouter } from "./routes/ap";
import arRouter from "./routes/ar";
import cashRouter from "./routes/cash";
import taxRouter from "./routes/tax";
import nettingRouter from "./routes/netting";
import portalRouter from "./routes/portal";
import arAiRouter from "./routes/ar-ai";
import arReportRouter from "./routes/ar-reports";
import { fixedAssetsRouter } from "./routes/fixedAssets";
import talentRouter from "./routes/talent";
import successionRouter from "./routes/talent_succession";
import learningRouter from "./routes/talent_learning";
import profileRouter from "./routes/talent_profile";
import rewardsRouter from "./routes/rewards";
import hrSelfServiceRouter from "./routes/hr_self_service";

import { constructionRouter } from "./modules/construction/routes";
import aiRouter from "./routes/ai";
import { aiService } from "./services/ai";
import { supplierPortalRouter } from "./routes/supplierPortal";
import contractPortalRouter from "./routes/contractPortal";
import { supplierPortalExternalRouter } from "./routes/supplierPortalExternal";
import publicCareersRouter from "./routes/public_careers";
import { mdmRouter } from "./routes/mdm";
// // import sourcingRouter from "./routes/sourcing"; // Refactored to modules/scm/routes.ts
// import { procurementRouter as PROCUREMENT_ROUTER } from "./modules/scm/procurementRoutes"; // Refactored to modules/scm/routes.ts

import transportationRouter from "./modules/transportation/routes";

import { billingRouter } from "./modules/billing/billing.controller";
import { orderRouter } from "./modules/order/order.controller";
import { lcmRouter } from "./modules/lcm/routes";
// import { wmsRoutes } from "./modules/scm/wms-routes"; // Refactored to modules/scm/routes.ts




import { ppmRouter } from "./modules/ppm/routes";
import wfmRouter from "./routes/wfm";
import { nexusAiRouter } from "./routes/nexus-ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Seed admin user for Quick Login
  await seedAdminUser();

  registerNotificationRoutes(app);
  registerFinanceRoutes(app);
  // Core Finance & ERP Routes
  // app.use("/api/finance", financeRouter); // Refactored to modules/finance/gl.routes.ts

  app.use("/api/ap", apRouter);
  app.use("/api/ar", arRouter);
  app.use("/api/ar/ai", arAiRouter);
  app.use("/api/ar", arReportRouter); // Shares prefix but mounts specific paths
  // app.use("/api/cash", cashRouter); // Refactored to modules/finance/banking.routes.ts

  app.use("/api/tax", taxRouter);
  app.use("/api/netting", nettingRouter);

  // Supplier Portal (Specific before generic)
  app.use("/api/supplier-portal", supplierPortalRouter);
  app.use("/api/contract-portal", contractPortalRouter);
  app.use("/api/supplier-portal", supplierPortalRouter);
  app.use("/api/contract-portal", contractPortalRouter);
  app.use("/api/portal/supplier", supplierPortalExternalRouter);
  app.use("/api", publicCareersRouter); // Mounts /public/jobs etc.

  // New Consolidated SCM Route
  app.use("/api/scm", scmRoutes);

  // Legacy SCM Routes (Mapped to New Controller)
  const legacyScmRouter = Router();
  legacyScmRouter.get("/purchase-orders", scmController.getPurchaseOrders);
  // legacyScmRouter.get("/vendors", scmController.listVendors); // Implement if missing
  legacyScmRouter.get("/requisitions", (req: any, res: any) => res.json([])); // Stub
  legacyScmRouter.get("/rfqs", scmController.listRfqs);

  app.use("/api", legacyScmRouter); // Mounts /api/purchase-orders
  app.use("/api/procurement", legacyScmRouter); // Mounts /api/procurement/requisitions

  // Stub for /api/vendors
  app.get("/api/vendors", (req, res) => res.json([]));

  // Legacy PPM Stub
  app.get("/api/ppm/summary", (req, res) => res.json({
    projectHealth: "Good",
    activeProjects: 12,
    budgetConsumed: 45
  }));

  // Legacy Ledger Stub
  app.get("/api/ledger", (req, res) => res.json({ message: "Use /api/finance/gl/ledgers" }));


  app.use("/api/portal", portalRouter); // Generic Portal (Customer)
  app.use("/api/fa", fixedAssetsRouter);
  app.use("/api/maintenance", maintenanceRouter);
  app.use("/api/ppm", ppmRouter);
  app.use("/api/construction", constructionRouter);
  app.use("/api/lcm", lcmRouter);
  app.use("/api/treasury", treasuryRouter);
  app.use("/api/wfm", wfmRouter);
  app.use("/api/mdm", mdmRouter);
  app.use("/api/hr-self-service", hrSelfServiceRouter);
  app.use("/api/treasury", treasuryRouter);
  app.use("/api/transportation", transportationRouter);
  app.use("/api/lease", leaseDirectRouter); // Lease Management
  app.use("/api/contracts", contractRoutes); // CLM Management


  // Enterprise Billing
  app.use("/api/intercompany", intercompanyRouter);
  app.use("/api", talentRouter);
  app.use("/api", successionRouter);
  app.use("/api", learningRouter);
  app.use("/api", profileRouter);
  app.use("/api", rewardsRouter);
  app.use("/api/billing", billingRouter);

  // SLA Configuration
  app.use("/api/sla", slaRouter);

  // Order Management
  app.use("/api/order-management", orderRouter);





  // Agentic AI
  app.use("/api", aiRouter);
  await aiService.initialize();

  // NexusAI Provider Management
  app.use("/api/nexus-ai", nexusAiRouter);

  // Apply RBAC middleware to all /api routes (except health check, auth, and public demo routes)
  app.use("/api", (req, res, next) => {
    // Exemptions for public/auth routes
    const publicPaths = [
      "/health", "/login", "/logout", "/callback", "/auth", "/demos",
      "/copilot", "/feedback", "/marketplace/categories",
      "/api/supplier-portal/register", "/portal/supplier", "/api/construction", "/api/ppm", "/api/public"
    ];

    // Check if path or prefix is public
    if (publicPaths.some(p => req.path === p || req.path.startsWith(p + "/"))) return next();

    // Check specifically for marketplace apps/details which can be public
    if (req.path.startsWith("/marketplace/apps")) return next();
    if (req.path.startsWith("/community")) return next();

    // Use the extracted middleware
    enforceRBAC()(req as any, res, next);
  });

  // GL Helper Routes (Plan to move to GL module)
  app.post("/api/gl/validate-ccid", async (req, res) => {
    res.json({ valid: true });
  });

  app.get("/api/gl/ledgers/:id/structure", async (req, res) => {
    try {
      const segments = await storage.listGlSegments(req.params.id);
      const structure = await Promise.all(segments.sort((a, b) => a.segmentNumber - b.segmentNumber).map(async seg => {
        const values = await storage.listGlSegmentValues(seg.id);
        return {
          name: seg.segmentName,
          id: seg.id,
          options: values.map(v => ({ val: v.value, desc: v.description }))
        };
      }));
      res.json(structure);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth User Endpoint
  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const claims = req.user.claims || {};
      return res.json({
        isAuthenticated: true,
        user: {
          id: claims.sub || req.user.id,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
          role: req.user.role || claims.role || "viewer",
          tenantId: req.user.tenantId || claims.tenant_id
        }
      });
    }
    return res.json({ isAuthenticated: false, user: null });
  });

  // Register Modular Routes
  registerDashboardRoutes(app);
  registerFinanceRoutes(app);
  // HR
  app.use("/api/hr", hrRouter);
  app.use("/api/hr/analytics", hrAnalyticsRouter);
  app.use("/api/hr/predictive", hrPredictiveRouter);
  app.use("/api/hr/reports", hrReportsRouter);
  app.use("/api/hr/config", hrConfigurationRouter);
  // Copilot (AI)
  app.use("/api/copilot", copilotRouter);
  registerProjectRoutes(app);
  // Manufacturing
  app.use("/api/manufacturing", manufacturingRouter);
  // SCM
  app.use("/api/scm", scmRoutes);
  registerPlatformRoutes(app);
  import("./modules/platform/tenant-routes").then(m => m.registerTenantRoutes(app));
  registerMarketplaceRoutes(app);

  registerCommunityRoutes(app);
  // Revenue
  app.use("/api/revenue", revenueRouter);
  // PPM
  app.use("/api/ppm", ppmRouter);

  // Register Legacy/Unrefactored Routes
  app.use(analyticsRoutes);
  app.use(templateRoutes);
  app.use(migrationRoutes);

  // CRM Module (Mounted)
  app.use("/api/crm", crmRouter);

  return httpServer;
}

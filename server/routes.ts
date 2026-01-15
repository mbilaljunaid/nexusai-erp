import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupPlatformAuth, seedAdminUser } from "./platformAuth";
import { enforceRBAC } from "./middleware/auth";
import { storage } from "./storage";

// Import modular routes
import { registerDashboardRoutes } from "./modules/dashboard/routes";
import { registerCrmRoutes } from "./modules/crm/routes";
import { registerFeedbackRoutes } from "./modules/feedback/routes";
import { registerCopilotRoutes } from "./modules/copilot/routes";
import { registerFinanceRoutes } from "./modules/finance/routes";
import { registerHrRoutes } from "./modules/hr/routes";
import { registerProjectRoutes } from "./modules/project/routes";
import { registerManufacturingRoutes } from "./modules/manufacturing/routes";
import { registerScmRoutes } from "./modules/scm/routes";
import { registerManufacturingPlanningRoutes } from "./modules/manufacturing/planningRoutes";
import { registerManufacturingProcessRoutes } from "./modules/manufacturing/processRoutes";
import { registerPlatformRoutes } from "./modules/platform/routes";
import { registerMarketplaceRoutes } from "./modules/marketplace/routes";
import { registerCommunityRoutes } from "./modules/community/routes";
import { registerRevenueRoutes } from "./modules/revenue/routes";
import { maintenanceRouter } from "./modules/maintenance/routes";


// Import existing routes files that were already modularized (if any)
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";

import financeRouter from "./routes/finance";
import { apRouter } from "./routes/ap";
import arRouter from "./routes/ar";
import cashRouter from "./routes/cash";
import taxRouter from "./routes/tax";
import nettingRouter from "./routes/netting";
import portalRouter from "./routes/portal";
import arAiRouter from "./routes/ar-ai";
import arReportRouter from "./routes/ar-reports";
import { fixedAssetsRouter } from "./routes/fixedAssets";
import { ppmRouter } from "./routes/ppm";
import aiRouter from "./routes/ai";
import { aiService } from "./services/ai";

import { billingRouter } from "./modules/billing/billing.controller";
import { orderRouter } from "./modules/order/order.controller";


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Seed admin user for Quick Login
  await seedAdminUser();

  // Core Finance & ERP Routes
  app.use("/api/finance", financeRouter);
  app.use("/api/ap", apRouter);
  app.use("/api/ar", arRouter);
  app.use("/api/ar/ai", arAiRouter);
  app.use("/api/ar", arReportRouter); // Shares prefix but mounts specific paths
  app.use("/api/cash", cashRouter);
  app.use("/api/tax", taxRouter);
  app.use("/api/netting", nettingRouter);
  app.use("/api/portal", portalRouter);
  app.use("/api/fa", fixedAssetsRouter);
  app.use("/api/maintenance", maintenanceRouter);
  app.use("/api/ppm", ppmRouter);


  // Enterprise Billing
  app.use("/api/billing", billingRouter);

  // Order Management
  app.use("/api/order-management", orderRouter);


  // Agentic AI
  app.use("/api", aiRouter);
  await aiService.initialize();

  // Apply RBAC middleware to all /api routes (except health check, auth, and public demo routes)
  app.use("/api", (req, res, next) => {
    // Exemptions for public/auth routes
    const publicPaths = [
      "/health", "/login", "/logout", "/callback", "/auth", "/demos",
      "/copilot", "/feedback", "/marketplace/categories"
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
  registerCrmRoutes(app);
  registerFeedbackRoutes(app);
  registerCopilotRoutes(app);
  registerFinanceRoutes(app);
  registerHrRoutes(app);
  registerProjectRoutes(app);
  registerManufacturingRoutes(app);
  registerScmRoutes(app);
  registerManufacturingPlanningRoutes(app);
  registerManufacturingProcessRoutes(app);
  registerPlatformRoutes(app);
  registerMarketplaceRoutes(app);
  registerMarketplaceRoutes(app);
  registerCommunityRoutes(app);
  registerRevenueRoutes(app);

  // Register Legacy/Unrefactored Routes
  app.use(analyticsRoutes);
  app.use(templateRoutes);
  app.use(migrationRoutes);

  return httpServer;
}

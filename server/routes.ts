import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupPlatformAuth, seedAdminUser } from "./platformAuth";
import { enforceRBAC } from "./middleware/auth";

// Import modular routes
import { registerDashboardRoutes } from "./modules/dashboard/routes";
import { registerCrmRoutes } from "./modules/crm/routes";
import { registerFeedbackRoutes } from "./modules/feedback/routes";
import { registerCopilotRoutes } from "./modules/copilot/routes";
import { registerFinanceRoutes } from "./modules/finance/routes";
import { registerHrRoutes } from "./modules/hr/routes";
import { registerProjectRoutes } from "./modules/project/routes";
import { registerManufacturingRoutes } from "./modules/manufacturing/routes";
import { registerPlatformRoutes } from "./modules/platform/routes";
import { registerMarketplaceRoutes } from "./modules/marketplace/routes";
import { registerCommunityRoutes } from "./modules/community/routes";

// Import existing routes files that were already modularized (if any)
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";

import financeRouter from "./routes/finance";
import apRouter from "./routes/ap"; // Added AP router
import arRouter from "./routes/ar"; // Added AR router
import cashRouter from "./routes/cash"; // Added Cash router
import aiRouter from "./routes/ai";
import { aiService } from "./services/ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Oracle Fusion Parity
  app.use("/api", financeRouter);
  app.use("/api/ap", apRouter); // Register AP routes
  app.use("/api/ar", arRouter); // Register AR routes
  app.use("/api/cash", cashRouter); // Register Cash routes

  // Agentic AI
  app.use("/api", aiRouter);
  await aiService.initialize();

  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Seed admin user for Quick Login
  await seedAdminUser();

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

    // Dashboard and CRM logic might overlap with authenticated data, check logic inside modules if needed
    // But for now we enforce RBAC on everything else

    // Use the extracted middleware
    enforceRBAC()(req as any, res, next);
  });

  // ========== AUTH USER ENDPOINT (for frontend auth check) ==========
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
  registerFinanceRoutes(app); // New
  registerHrRoutes(app);      // New
  registerProjectRoutes(app); // New
  registerManufacturingRoutes(app); // New
  registerPlatformRoutes(app); // New
  registerMarketplaceRoutes(app); // New
  registerCommunityRoutes(app); // New

  // Register Legacy/Unrefactored Routes
  app.use(analyticsRoutes);
  app.use(templateRoutes);
  app.use(migrationRoutes);

  return httpServer;
}

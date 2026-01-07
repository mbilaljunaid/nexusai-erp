import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupPlatformAuth, seedAdminUser } from "./platformAuth";
import { enforceRBAC } from "./middleware/auth";

// Import modular routes
import { registerDashboardRoutes } from "./modules/dashboard/routes";
import { registerCrmRoutes } from "./modules/crm/routes";
import { registerFeedbackRoutes } from "./modules/feedback/routes";
import { registerCopilotRoutes } from "./modules/copilot/routes";

// Import existing routes files that were already modularized (if any)
import analyticsRoutes from "./routes/analyticsRoutes";
import templateRoutes from "./routes/templateRoutes";
import migrationRoutes from "./routes/migrationRoutes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Seed admin user for Quick Login
  await seedAdminUser();

  // Apply RBAC middleware to all /api routes (except health check, auth, and public demo routes)
  app.use("/api", (req, res, next) => {
    if (req.path === "/health") return next();
    if (req.path.startsWith("/auth")) return next();
    if (req.path === "/login") return next();
    if (req.path === "/logout") return next();
    if (req.path === "/callback") return next();
    if (req.path === "/demos/industries") return next();
    if (req.path === "/demos/request") return next();
    if (req.path === "/demos/list") return next();
    if (req.path.startsWith("/copilot")) return next();
    if (req.path === "/feedback") return next();
    if (req.path === "/auth/user") return next();
    if (req.path === "/marketplace/categories") return next();
    if (req.path === "/marketplace/apps") return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+$/)) return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+\/reviews$/)) return next();
    if (req.path.match(/^\/marketplace\/apps\/[^/]+\/dependencies$/)) return next();
    if (req.path.startsWith("/community")) return next();
    if (req.path.startsWith("/dashboard")) return next();
    if (req.path.startsWith("/crm")) return next();

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

  // Register Legacy/Unrefactored Routes
  // TODO: Refactor these into modules as well
  app.use(analyticsRoutes);
  app.use(templateRoutes);
  app.use(migrationRoutes);

  return httpServer;
}

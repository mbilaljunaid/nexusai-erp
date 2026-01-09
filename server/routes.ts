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
import { apRouter } from "./routes/ap";
import arRouter from "./routes/ar";
import cashRouter from "./routes/cash"; // Added Cash router
import { fixedAssetsRouter } from "./routes/fixedAssets";
import aiRouter from "./routes/ai";
import { aiService } from "./services/ai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Platform Auth (email/password authentication)
  await setupPlatformAuth(app);

  // Seed admin user for Quick Login
  await seedAdminUser();

  // Oracle  // Finance & ERP
  app.use("/api/finance", financeRouter);
  app.use("/api/ap", apRouter);
  app.use("/api/ar", arRouter); // Assuming arRouter exists or will exist
  app.use("/api/ap", apRouter); // Register AP routes
  app.use("/api/ar", arRouter); // Register AR routes
  app.use("/api/cash", cashRouter); // Register Cash routes
  app.use("/api/fa", fixedAssetsRouter); // Register FA routes

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

    // Dashboard and CRM logic might overlap with authenticated data, check logic inside modules if needed
    // But for now we enforce RBAC on everything else

    // Use the extracted middleware
    enforceRBAC()(req as any, res, next);
  });

  // Add API to fetch segments and values for picker.
  app.post("/api/gl/validate-ccid", async (req, res) => {
    // Placeholder for CCID validation
    // In real app, checks segment combinations
    res.json({ valid: true });
  });

  app.get("/api/gl/ledgers/:id/structure", async (req, res) => {
    try {
      // Assuming 'storage' is imported or available in scope, e.g., from a data layer
      // For this example, I'll add a placeholder for 'storage' if it's not globally available
      // In a real app, you'd import it: import * as storage from "./data/storage";
      const storage = {
        listGlSegments: async (ledgerId: string) => {
          // Mock data for segments
          if (ledgerId === "1") {
            return [
              { id: "seg1", segmentName: "Company", segmentNumber: 1 },
              { id: "seg2", segmentName: "Account", segmentNumber: 2 },
              { id: "seg3", segmentName: "Department", segmentNumber: 3 },
            ];
          }
          return [];
        },
        listGlSegmentValues: async (segmentId: string) => {
          // Mock data for segment values
          if (segmentId === "seg1") {
            return [{ value: "001", description: "Headquarters" }, { value: "002", description: "Branch Office" }];
          } else if (segmentId === "seg2") {
            return [{ value: "1000", description: "Cash" }, { value: "2000", description: "Accounts Payable" }];
          } else if (segmentId === "seg3") {
            return [{ value: "100", description: "Sales" }, { value: "200", description: "Marketing" }];
          }
          return [];
        }
      };

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

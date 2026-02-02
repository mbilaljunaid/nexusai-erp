import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertAppSchema, insertAppReviewSchema, insertAppInstallationSchema } from "../../../shared/schema";

export function registerMarketplaceRoutes(app: Express) {
    // Apps
    app.get("/api/marketplace/apps", async (req, res) => {
        try {
            const apps = await storage.listApps();
            res.json(apps);
        } catch (error) {
            res.status(500).json({ error: "Failed to list apps" });
        }
    });

    app.get("/api/marketplace/apps/:id", async (req, res) => {
        try {
            const app = await storage.getApp(req.params.id);
            if (!app) return res.status(404).json({ error: "App not found" });
            res.json(app);
        } catch (error) {
            res.status(500).json({ error: "Failed to get app" });
        }
    });

    app.post("/api/marketplace/apps", async (req, res) => {
        try {
            const parseResult = insertAppSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const app = await storage.createApp(parseResult.data);
            res.status(201).json(app);
        } catch (error) {
            res.status(500).json({ error: "Failed to create app" });
        }
    });

    // Reviews
    app.get("/api/marketplace/reviews", async (req, res) => {
        try {
            const reviews = await storage.listAppReviews(req.query.appId as string);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: "Failed to list reviews" });
        }
    });

    app.post("/api/marketplace/reviews", async (req, res) => {
        try {
            const parseResult = insertAppReviewSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const review = await storage.createAppReview(parseResult.data);
            res.status(201).json(review);
        } catch (error) {
            res.status(500).json({ error: "Failed to create review" });
        }
    });

    // Installations
    app.get("/api/marketplace/installations", async (req, res) => {
        try {
            const installations = await storage.listAppInstallations(req.query.userId as string);
            res.json(installations);
        } catch (error) {
            res.status(500).json({ error: "Failed to list installations" });
        }
    });
}

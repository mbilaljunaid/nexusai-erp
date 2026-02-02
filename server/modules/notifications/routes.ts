
import { Express } from "express";

export function registerNotificationRoutes(app: Express) {
    app.get("/api/notifications", (req, res) => {
        res.json([]);
    });

    app.get("/api/notifications/unread-count", (req, res) => {
        res.json({ count: 0 });
    });
}

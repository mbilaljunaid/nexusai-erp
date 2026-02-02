import { Router } from "express";
import { aiService } from "../services/ai";
import { storage } from "../storage";

const router = Router();

// Initialize AI Actions (Run once on startup or via this trigger)
router.post("/ai/init", async (req, res) => {
    await aiService.initialize();
    res.json({ message: "AI Actions Initialized" });
});

// Parse Natural Language Intent
router.post("/ai/parse", async (req, res) => {
    const { prompt, userId, context } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // In a real app, userId would come from session
    const result = await aiService.parseIntent(prompt, userId || "anonymous", context);
    res.json(result);
});

// Execute AI Action
router.post("/ai/execute", async (req, res) => {
    const { actionName, params, userId } = req.body;

    try {
        const result = await aiService.executeAction(userId || "anonymous", actionName, params);
        res.json({ status: "success", data: result });
    } catch (e: any) {
        res.status(500).json({ status: "error", message: e.message });
    }
});

// List Audit Logs
router.get("/ai/logs", async (req, res) => {
    const logs = await storage.listAiAuditLogs();
    res.json(logs);
});

export default router;

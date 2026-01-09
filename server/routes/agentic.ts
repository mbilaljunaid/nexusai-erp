
import { Router } from "express";
import { agenticService } from "../services/agentic";

export const agenticRouter = Router();

agenticRouter.post("/intent/parse", async (req, res) => {
    try {
        const { text, context } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const result = await agenticService.parseIntent(text, context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

agenticRouter.post("/intent/execute", async (req, res) => {
    try {
        const { text, userId, context } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const result = await agenticService.executeAction(text, userId || "system", context);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

// Future endpoints
// agenticRouter.post("/intent/validate", ...);
// agenticRouter.post("/intent/rollback", ...);

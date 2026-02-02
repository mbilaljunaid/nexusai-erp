import { Request, Response } from "express";
import { CopilotService } from "./services/CopilotService";

export class CopilotController {
    private copilotService: CopilotService;

    constructor() {
        this.copilotService = new CopilotService();
    }

    handleChat = async (req: Request, res: Response) => {
        try {
            const { message, context = "general" } = req.body;

            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Message is required" });
            }

            const response = await this.copilotService.chat(message, context);
            res.json({ response });
        } catch (error: any) {
            console.error("Copilot chat error:", error);
            res.status(500).json({
                error: "Failed to get AI response",
                message: error.message || "Unknown error"
            });
        }
    }

    handleContextualChat = async (req: Request, res: Response) => {
        try {
            const { message, context, conversationHistory = [] } = req.body;

            if (!message || typeof message !== "string") {
                return res.status(400).json({ error: "Message is required" });
            }

            // Get user from session (populated by auth middleware)
            const sessionUser = (req as any).user;
            const mode = context?.mode || "info";

            // Verify authentication for action mode
            if (mode === "action" && !sessionUser) {
                return res.status(401).json({ error: "Authentication required for action mode. Please log in." });
            }

            const result = await this.copilotService.contextualChat(
                message,
                context,
                conversationHistory,
                sessionUser
            );

            res.json(result);
        } catch (error: any) {
            console.error("Contextual Copilot error:", error);
            res.status(500).json({
                error: "Failed to process contextual request",
                message: error.message || "Unknown error"
            });
        }
    }
}

export const copilotController = new CopilotController();

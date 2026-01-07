import { Express, Request, Response } from "express";
import { insertUserFeedbackSchema } from "../../../shared/schema";
import { storage } from "../../storage"; // Keeping memory storage for feedback for now as it was in original

export function registerFeedbackRoutes(app: Express) {
    app.post("/api/feedback", async (req, res) => {
        try {
            const parseResult = insertUserFeedbackSchema.safeParse(req.body);

            if (!parseResult.success) {
                const errors = parseResult.error.errors.map(e => e.message).join(", ");
                return res.status(400).json({ error: errors });
            }

            const feedback = await storage.createUserFeedback(parseResult.data);
            console.log(`Feedback submitted: ${feedback.id} - ${feedback.title}`);

            res.status(201).json({ success: true, feedback });
        } catch (error: any) {
            console.error("Feedback submission error:", error);
            res.status(500).json({ error: "Failed to submit feedback" });
        }
    });

    app.get("/api/feedback", async (req, res) => {
        try {
            const feedbackList = await storage.listUserFeedback();
            res.json(feedbackList);
        } catch (error) {
            console.error("Error fetching feedback:", error);
            res.status(500).json({ error: "Failed to fetch feedback" });
        }
    });
}

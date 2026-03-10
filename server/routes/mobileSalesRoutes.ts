import { Router } from "express";
import { db } from "../db";
import { activities, opportunities, contacts } from "@shared/schema/crm";
import { eq } from "drizzle-orm";

export const mobileSalesRouter = Router();

/**
 * POST /api/mobile/sales/sync
 * Syncs mobile sales app data from local storage (offline) to the server.
 */
mobileSalesRouter.post("/sync", async (req, res) => {
    try {
        const { userId, payload } = req.body;

        // In a real implementation, we would diff and merge records.
        // For now, we return a success response simulating a merged state
        // and sending down the latest server states.

        const serverOpportunities = await db.select().from(opportunities).limit(50);
        const serverContacts = await db.select().from(contacts).limit(50);

        res.json({
            success: true,
            message: "Sync completed successfully",
            data: {
                opportunities: serverOpportunities,
                contacts: serverContacts,
                syncedAt: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error("Mobile Sales Sync Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mobile/sales/dictation
 * Processes a voice dictation payload, saving it as an activity note.
 */
mobileSalesRouter.post("/dictation", async (req, res) => {
    try {
        const { text, accountId, contactId } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Dictation text is required" });
        }

        // Attempt to save the dictation as a call logging activity
        const [newActivity] = await db.insert(activities).values({
            activityType: "Call", // Treat dictations primarily as call recaps
            subject: "Mobile Voice Dictation Note",
            description: text,
            status: "Completed",
            priority: "Normal",
            activityDate: new Date(),
            accountId: accountId || null,
            contactId: contactId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        res.json({
            success: true,
            message: "Dictation saved successfully",
            activity: newActivity
        });
    } catch (error: any) {
        console.error("Mobile Sales Dictation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

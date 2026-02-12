
import { Router } from "express";
import { db } from "../../db";
import { cases, insertCaseSchema, caseComments } from "../../../shared/schema";
import { caseManagementService } from "../../services/CaseService";
import { eq, desc } from "drizzle-orm";

export const caseRoutes = Router();

// LIST
caseRoutes.get("/", async (req, res) => {
    try {
        const result = await caseManagementService.getAll();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
caseRoutes.post("/", async (req, res) => {
    try {
        const data = insertCaseSchema.parse(req.body);
        const result = await caseManagementService.create(data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET DETAILS
caseRoutes.get("/:id", async (req, res) => {
    try {
        const result = await caseManagementService.getById(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
caseRoutes.patch("/:id", async (req, res) => {
    try {
        const result = await caseManagementService.update(req.params.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ADD COMMENT
caseRoutes.post("/:id/comments", async (req, res) => {
    try {
        const { body, author } = req.body;
        if (!body) return res.status(400).json({ error: "Body required" });

        const [comment] = await db.insert(caseComments).values({
            caseId: req.params.id,
            body,
            author: author || "system"
        }).returning();

        res.json(comment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

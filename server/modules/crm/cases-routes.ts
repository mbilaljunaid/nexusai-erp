
import { Router } from "express";
import { db } from "../../db";
import { cases, insertCaseSchema } from "../../../shared/schema";
import { CaseService } from "../../services/CaseService";
import { eq, desc } from "drizzle-orm";

export const caseRoutes = Router();

// LIST
caseRoutes.get("/", async (req, res) => {
    try {
        const result = await db.select().from(cases).orderBy(desc(cases.createdAt));
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
caseRoutes.post("/", async (req, res) => {
    try {
        const data = insertCaseSchema.parse(req.body);
        const result = await CaseService.createCase(data, "system"); // TODO: Use req.user.id
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET DETAILS
caseRoutes.get("/:id", async (req, res) => {
    try {
        const result = await CaseService.getCaseDetails(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
caseRoutes.patch("/:id", async (req, res) => {
    try {
        const result = await CaseService.updateCase(req.params.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ADD COMMENT
caseRoutes.post("/:id/comments", async (req, res) => {
    try {
        const { body } = req.body;
        if (!body) return res.status(400).json({ error: "Body required" });
        const result = await CaseService.addComment(req.params.id, body, "system"); // TODO: Use req.user.id
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

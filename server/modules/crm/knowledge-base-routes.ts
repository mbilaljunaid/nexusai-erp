
import { Router } from "express";
import { insertKnowledgeArticleSchema } from "../../../shared/schema";
import { KnowledgeBaseService } from "../../services/KnowledgeBaseService";

export const knowledgeBaseRoutes = Router();

// LIST / SEARCH
knowledgeBaseRoutes.get("/", async (req, res) => {
    try {
        const query = req.query.query as string;
        const result = await KnowledgeBaseService.searchArticles(query);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// SUGGESTIONS
knowledgeBaseRoutes.get("/suggest", async (req, res) => {
    try {
        const query = req.query.query as string;
        const result = await KnowledgeBaseService.getSuggestedArticles(query || "");
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE
knowledgeBaseRoutes.post("/", async (req, res) => {
    try {
        const data = insertKnowledgeArticleSchema.parse(req.body);
        const result = await KnowledgeBaseService.createArticle(data);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET ONE
knowledgeBaseRoutes.get("/:id", async (req, res) => {
    try {
        const result = await KnowledgeBaseService.getArticle(req.params.id);
        if (!result) return res.status(404).json({ error: "Article not found" });
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
knowledgeBaseRoutes.patch("/:id", async (req, res) => {
    try {
        const result = await KnowledgeBaseService.updateArticle(req.params.id, req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

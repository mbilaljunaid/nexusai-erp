import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertCommunitySpaceSchema, insertCommunityPostSchema, insertCommunityCommentSchema } from "../../../shared/schema";

export function registerCommunityRoutes(app: Express) {
    // Spaces
    app.get("/api/community/spaces", async (req, res) => {
        try {
            const spaces = await storage.listCommunitySpaces();
            res.json(spaces);
        } catch (error) {
            res.status(500).json({ error: "Failed to list spaces" });
        }
    });

    app.post("/api/community/spaces", async (req, res) => {
        try {
            // Only admin should do this, logic handled by RBAC middleware
            const parseResult = insertCommunitySpaceSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const space = await storage.createCommunitySpace(parseResult.data);
            res.status(201).json(space);
        } catch (error) {
            res.status(500).json({ error: "Failed to create space" });
        }
    });

    // Posts
    app.get("/api/community/posts", async (req, res) => {
        try {
            const posts = await storage.listCommunityPosts(req.query.spaceId as string);
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: "Failed to list posts" });
        }
    });

    app.post("/api/community/posts", async (req, res) => {
        try {
            const parseResult = insertCommunityPostSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const post = await storage.createCommunityPost(parseResult.data);
            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ error: "Failed to create post" });
        }
    });

    // Comments
    app.get("/api/community/comments", async (req, res) => {
        try {
            const postId = req.query.postId as string;
            if (!postId) return res.status(400).json({ error: "Post ID required" });
            const comments = await storage.listCommunityComments(postId);
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: "Failed to list comments" });
        }
    });

    app.post("/api/community/comments", async (req, res) => {
        try {
            const parseResult = insertCommunityCommentSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const comment = await storage.createCommunityComment(parseResult.data);
            res.status(201).json(comment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create comment" });
        }
    });
}

import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertProjectSchema, insertSprintSchema, insertIssueSchema } from "../../../shared/schema";

export function registerProjectRoutes(app: Express) {
    // Projects
    app.get("/api/projects", async (req, res) => {
        try {
            const projects = await storage.listProjects(req.query.ownerId as string);
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: "Failed to list projects" });
        }
    });

    app.get("/api/projects/:id", async (req, res) => {
        try {
            const project = await storage.getProject(req.params.id);
            if (!project) return res.status(404).json({ error: "Project not found" });
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: "Failed to get project" });
        }
    });

    app.post("/api/projects", async (req, res) => {
        try {
            const parseResult = insertProjectSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const project = await storage.createProject(parseResult.data);
            res.status(201).json(project);
        } catch (error) {
            res.status(500).json({ error: "Failed to create project" });
        }
    });

    // Sprints
    app.get("/api/sprints", async (req, res) => {
        try {
            const sprints = await storage.listSprints(req.query.projectId as string);
            res.json(sprints);
        } catch (error) {
            res.status(500).json({ error: "Failed to list sprints" });
        }
    });

    app.post("/api/sprints", async (req, res) => {
        try {
            const parseResult = insertSprintSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const sprint = await storage.createSprint(parseResult.data);
            res.status(201).json(sprint);
        } catch (error) {
            res.status(500).json({ error: "Failed to create sprint" });
        }
    });

    // Issues
    app.get("/api/issues", async (req, res) => {
        try {
            const issues = await storage.listIssues(req.query.sprintId as string);
            res.json(issues);
        } catch (error) {
            res.status(500).json({ error: "Failed to list issues" });
        }
    });

    app.post("/api/issues", async (req, res) => {
        try {
            const parseResult = insertIssueSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const issue = await storage.createIssue(parseResult.data);
            res.status(201).json(issue);
        } catch (error) {
            res.status(500).json({ error: "Failed to create issue" });
        }
    });
}

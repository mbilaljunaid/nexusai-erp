import { Express, Request, Response } from "express";
import { storage } from "../../storage";
import { insertTenantSchema, insertRoleSchema, insertComplianceConfigSchema } from "../../../shared/schema";

export function registerPlatformRoutes(app: Express) {
    // Tenants
    app.get("/api/platform/tenants", async (req, res) => {
        try {
            const tenants = await storage.listTenants();
            res.json(tenants);
        } catch (error) {
            res.status(500).json({ error: "Failed to list tenants" });
        }
    });

    app.post("/api/platform/tenants", async (req, res) => {
        try {
            const parseResult = insertTenantSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const tenant = await storage.createTenant(parseResult.data);
            res.status(201).json(tenant);
        } catch (error) {
            res.status(500).json({ error: "Failed to create tenant" });
        }
    });

    // Roles
    app.get("/api/platform/roles", async (req, res) => {
        try {
            const roles = await storage.listRoles(req.query.tenantId as string);
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: "Failed to list roles" });
        }
    });

    app.post("/api/platform/roles", async (req, res) => {
        try {
            const parseResult = insertRoleSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error });
            }
            const role = await storage.createRole(parseResult.data);
            res.status(201).json(role);
        } catch (error) {
            res.status(500).json({ error: "Failed to create role" });
        }
    });

    // Compliance
    app.get("/api/platform/compliance", async (req, res) => {
        try {
            const configs = await storage.listComplianceConfigs();
            res.json(configs);
        } catch (error) {
            res.status(500).json({ error: "Failed to list compliance configs" });
        }
    });
}

import { Express } from "express";
import { scmService } from "../../services/ScmService";
import { insertInventorySchema } from "../../../shared/schema";

export function registerScmRoutes(app: Express) {
    app.get("/api/scm/inventory", async (req, res) => {
        try {
            const items = await scmService.listInventory();
            res.json(items);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/scm/inventory", async (req, res) => {
        try {
            const parseResult = insertInventorySchema.safeParse(req.body);
            if (!parseResult.success) return res.status(400).json({ error: parseResult.error });
            const item = await scmService.createInventoryItem(parseResult.data);
            res.status(201).json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
}

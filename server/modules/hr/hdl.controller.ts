import { Request, Response } from "express";
import { HdlService } from "./services/HdlService";

export async function importWorkers(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const userId = (req as any).user?.id || "system";
        const { csv, fileName } = req.body;

        if (!csv) {
            return res.status(400).json({ message: "CSV content is required" });
        }

        const result = await HdlService.importWorkers(tenantId, userId, csv, fileName || "upload.csv");
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error importing workers:", error);
        res.status(500).json({ message: error.message });
    }
}

export async function getRecentImports(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const result = await HdlService.getRecentImports(tenantId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

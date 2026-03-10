import { Request, Response } from "express";
import { AuditLogService } from "./services/AuditLogService";

async function listLogs(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const userId = (req as any).user?.id;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

        const logs = await AuditLogService.listLogs(tenantId, userId, limit);
        res.json(logs);
    } catch (error: any) {
        console.error("Error listing audit logs:", error);
        res.status(500).json({ message: error.message });
    }
}

export const auditController = {
    listLogs
};

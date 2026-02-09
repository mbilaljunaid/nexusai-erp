import { Request, Response, NextFunction } from "./types";
import { storage } from "../storage";
import { log } from "../index";
import { auditService } from "../services/audit_service";

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only audit state-mutating methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const originalSend = res.send;

        res.send = function (body: any) {
            res.send = originalSend; // Restore original to prevent infinite loop if called again

            // Perform logging asynchronously to not block response
            const logAudit = async () => {
                try {
                    const userId = req.user?.id || "anonymous";
                    const resource = req.path;
                    const action = req.method;
                    const success = res.statusCode >= 200 && res.statusCode < 300;

                    const auditEntry = {
                        userId,
                        action,
                        entityType: "API_RESOURCE",
                        entityId: resource,
                        oldValue: {},
                        newValue: { statusCode: res.statusCode, method: req.method },
                        status: success ? "SUCCESS" : "FAILURE",
                        ipAddress: req.ip,
                        userAgent: req.get("user-agent"),
                    };

                    await auditService.logAction(auditEntry);
                } catch (error) {
                    console.error("Failed to log audit event:", error);
                }
            };

            logAudit();

            return originalSend.apply(res, [body]);
        };
    }

    next();
};

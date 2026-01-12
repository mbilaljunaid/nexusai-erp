import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { log } from "../index";
import { auditService } from "../services/audit_service";

// Extend Express Request to include user info (populated by auth middleware)
declare global {
    namespace Express {
        interface User {
            id: string;
            role?: string;
        }
        interface Request {
            user?: User;
        }
    }
}

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only audit state-mutating methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const originalSend = res.send;

        res.send = function (body) {
            res.send = originalSend; // Restore original to prevent infinite loop if called again

            // Perform logging asynchronously to not block response
            const logAudit = async () => {
                try {
                    // Identify user (if authenticated)
                    const userId = req.user?.id || "anonymous";
                    const resource = req.path;
                    const action = req.method;
                    const success = res.statusCode >= 200 && res.statusCode < 300;

                    // In a real DB scenario, we would insert into an AuditLog table
                    // For now, we'll use the console log format but structured for future extraction
                    // and potentially store in memory if specific critical actions

                    const auditEntry = {
                        userId,
                        action,
                        entityType: "API_RESOURCE",
                        entityId: resource,
                        oldValue: {}, // Can't capture easily in middleware without buffering
                        newValue: { statusCode: res.statusCode, method: req.method },
                        status: success ? "SUCCESS" : "FAILURE",
                        ipAddress: req.ip,
                        userAgent: req.get("user-agent"),
                    };

                    // Async persistence
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

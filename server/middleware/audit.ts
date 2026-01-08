import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { log } from "../index";

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
                        timestamp: new Date(),
                        userId,
                        action,
                        resource,
                        status: success ? "SUCCESS" : "FAILURE",
                        statusCode: res.statusCode,
                        ip: req.ip,
                        userAgent: req.get("user-agent"),
                    };

                    log(`[AUDIT] ${JSON.stringify(auditEntry)}`, "audit");

                    // Future: storage.createAuditLog(auditEntry);
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

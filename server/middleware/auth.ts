import { Request, Response, NextFunction } from "express";

// Extended Request type to include auth properties
export interface AuthenticatedRequest extends Request {
    tenantId?: string;
    userId?: string;
    role?: string;
    user?: any;
}

// RBAC Enforcement Middleware
export const enforceRBAC = (requiredPermission?: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const tenantId = req.headers["x-tenant-id"] as string;
        const userId = req.headers["x-user-id"] as string;

        // If user is already authenticated via session (Platform Auth), use that
        if (req.user) {
            req.tenantId = req.user.tenantId || "default";
            req.userId = req.user.id;
            req.role = req.user.role || "viewer";
        } else {
            // Fallback to headers (Legacy/API usage)
            if (!tenantId || !userId) {
                return res.status(401).json({ error: "Missing tenant or user context" });
            }

            req.tenantId = tenantId;
            req.userId = userId;
            req.role = (req.headers["x-user-role"] as string) || "viewer";
        }

        // Simple role-based check
        if (requiredPermission) {
            const rolePermissions: Record<string, string[]> = {
                admin: ["read", "write", "delete", "admin"],
                editor: ["read", "write"],
                viewer: ["read"],
            };
            const allowedPerms = rolePermissions[req.role] || [];
            if (!allowedPerms.includes(requiredPermission)) {
                return res.status(403).json({ error: "Insufficient permissions" });
            }
        }

        next();
    };
};

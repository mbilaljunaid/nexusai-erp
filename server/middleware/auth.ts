import { Request, Response, NextFunction } from "express";

// Extended Request type to include auth properties
export interface AuthenticatedRequest extends Request {
    tenantId?: string;
    userId?: string;
    role?: string;
    user?: any;
}

// RBAC Enforcement Middleware
import { ROLES, ROLE_PERMISSIONS, hasPermission } from "../../shared/schema/roles";

export const enforceRBAC = (requiredPermission?: string) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const tenantId = req.headers["x-tenant-id"] as string;
        const userId = req.headers["x-user-id"] as string;


        // If user is already authenticated via session (Platform Auth)
        // @ts-ignore
        if (req.session && req.session.userId) {
            // @ts-ignore
            req.userId = req.session.userId;
            // @ts-ignore
            req.role = req.session.userRole || ROLES.GL_VIEWER;
            req.tenantId = "default"; // Default tenant for platform auth users
        } else if (req.user) {
            req.tenantId = req.user.tenantId || "default";
            req.userId = req.user.id;
            req.role = req.user.role || ROLES.GL_VIEWER;
        } else {
            // Fallback to headers (Legacy/API usage)
            if (!tenantId || !userId) {
                // Allow non-strict mode for debugging if needed, or enforce strictness
                // return res.status(401).json({ error: "Missing tenant or user context" });
                req.tenantId = "default-tenant";
                req.userId = "anon-user";
                req.role = ROLES.GL_VIEWER;
            } else {
                req.tenantId = tenantId;
                req.userId = userId;
                req.role = (req.headers["x-user-role"] as string) || ROLES.GL_VIEWER;
            }
        }

        // Expanded Permission Check
        if (requiredPermission) {
            const role = req.role || ROLES.GL_VIEWER;

            // Check implicit permissions from role map
            if (!hasPermission(role, requiredPermission)) {
                return res.status(403).json({ error: `Insufficient permissions. Role '${role}' lacks '${requiredPermission}'.` });
            }
        }

        next();
    };
};

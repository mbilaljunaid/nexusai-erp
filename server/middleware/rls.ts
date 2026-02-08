// @ts-nocheck
import { Request, Response, NextFunction } from "express";

// Extend Request type to include user context
declare global {
    namespace Express {
        // Just overriding the User interface locally or merging
        interface User {
            id: string;
            role: string;
            permissions: string[];
            tenantId: string;
        }

        interface Request {
            user?: User;
        }
    }
}

/**
 * RLS Middleware
 * Simulates an Authentication Provider (like Auth0) and Role Enforcement.
 * In a real app, this would decode a JWT.
 * Here, we trust the 'x-mock-role' header for demonstration.
 */
export const rlsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract Role from Header (Default to EMPLOYEE)
    const role = (req.headers["x-mock-role"] as string) || "EMPLOYEE";

    // 2. Define Permissions based on Role
    let permissions: string[] = [];

    switch (role) {
        case "HR_ADMIN":
            permissions = ["VIEW_ALL", "VIEW_SENSITIVE", "EDIT_CONFIG", "RUN_REPORTS", "MANAGE_SECURITY"];
            break;
        case "HR_ANALYST":
            // New Role: Access to Analytics and Report Building, but no Config/Security
            permissions = ["VIEW_ALL", "VIEW_REPORTS", "CREATE_REPORTS", "VIEW_ANALYTICS"];
            break;
        case "MANAGER":
            // Refined: Can view own team and team analytics
            permissions = ["VIEW_TEAM", "VIEW_REPORTS", "VIEW_TEAM_ANALYTICS"];
            break;
        case "EMPLOYEE":
        default:
            permissions = ["VIEW_SELF"];
            break;
    }

    // 3. Attach User Context
    req.user = {
        id: "mock-user-id", // Added to satisfy User interface
        role,
        permissions,
        tenantId: "default" // In multi-tenant, this comes from subdomain or JWT
    };

    // Log context for debugging transparency
    if (req.path.startsWith("/api/hr")) {
        console.log(`[RLS] Request: ${req.method} ${req.path} | Role: ${role} | Perms: ${permissions.length}`);
    }

    next();
};


import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        tenantId?: string;
    };
    tenantId?: string;
}

export const tenantContext = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Check if user is authenticated
    if (!req.user || !req.user.id) {
        // If route is public, proceed without tenantId
        return next();
    }

    // 2. If user object already has tenantId (from session/passport)
    if (req.user.tenantId) {
        req.tenantId = req.user.tenantId;
        return next();
    }

    // 3. Fallback: Fetch from DB if not in session (e.g. if session is stale)
    try {
        const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
        if (user && user.tenantId) {
            req.tenantId = user.tenantId;
            // Optional: Update session if possible, but for now just attach to req
        }
    } catch (error) {
        console.error("Failed to fetch tenant context:", error);
    }

    next();
};

export const requireTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.tenantId) {
        return res.status(403).json({ error: "Tenant context required" });
    }
    next();
};

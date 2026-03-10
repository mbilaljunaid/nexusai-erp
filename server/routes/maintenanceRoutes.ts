/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import { db } from "../db";
import * as schema from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// ============================================================================
// PERMIT TYPE MANAGEMENT
// ============================================================================

/**
 * GET /maintenance/permit-types
 * Get all permit types
 */
router.get("/permit-types", async (_req: Request, res: Response) => {
    try {
        const data = await db.query.maintPermitTypes.findMany({
            orderBy: (types, { asc }) => [asc(types.name)],
        });

        // Map database fields to frontend expected format
        const permitTypes = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            requiresApproval: row.requiresApproval ?? true,
            approvalLevels: row.approvalLevels ?? 1,
            validityHours: row.validityHours ?? 8,
            requiredDocuments: row.requiredDocuments || []
        }));

        res.json(permitTypes);
    } catch (error: any) {
        console.error("Error fetching permit types:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /maintenance/permit-types/:id
 * Get specific permit type by ID
 */
router.get("/permit-types/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const data = await db.query.maintPermitTypes.findFirst({
            where: eq(schema.maintPermitTypes.id, id),
        });

        if (!data) {
            return res.status(404).json({ error: "Permit type not found" });
        }

        const permitType = {
            id: data.id,
            name: data.name,
            description: data.description,
            requiresApproval: data.requiresApproval ?? true,
            approvalLevels: data.approvalLevels ?? 1,
            validityHours: data.validityHours ?? 8,
            requiredDocuments: data.requiredDocuments || []
        };

        res.json(permitType);
    } catch (error: any) {
        console.error("Error fetching permit type:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

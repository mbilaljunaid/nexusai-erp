/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";

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
        const { data, error } = await supabase
            .from("permit_types")
            .select("*")
            .order("name");

        if (error) throw error;

        // Map database fields to frontend expected format
        const permitTypes = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            requiresApproval: row.requires_approval ?? true,
            approvalLevels: row.approval_levels ?? 1,
            validityHours: row.validity_hours ?? 8,
            requiredDocuments: row.required_documents || []
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

        const { data, error } = await supabase
            .from("permit_types")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: "Permit type not found" });
        }

        const permitType = {
            id: data.id,
            name: data.name,
            description: data.description,
            requiresApproval: data.requires_approval ?? true,
            approvalLevels: data.approval_levels ?? 1,
            validityHours: data.validity_hours ?? 8,
            requiredDocuments: data.required_documents || []
        };

        res.json(permitType);
    } catch (error: any) {
        console.error("Error fetching permit type:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;

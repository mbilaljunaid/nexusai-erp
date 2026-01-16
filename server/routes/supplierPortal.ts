import { Router } from "express";
import { supplierPortalService } from "../services/SupplierPortalService";
import { enforceRBAC } from "../middleware/auth";
import { ROLES } from "../../shared/schema/roles";

export const supplierPortalRouter = Router();

/**
 * PUBLIC: Submit registration request
 * Accessible by prospective suppliers without an account
 */
supplierPortalRouter.post("/register", async (req, res) => {
    try {
        const request = await supplierPortalService.submitRegistration(req.body);
        res.json(request);
    } catch (error: any) {
        console.error("[SupplierPortal] Registration Error:", error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * INTERNAL: List all pending onboarding requests
 */
supplierPortalRouter.get("/onboarding/pending", enforceRBAC('scm_write'), async (req: any, res) => {
    try {
        const requests = await supplierPortalService.listPendingRequests();
        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * INTERNAL: Approve a registration request
 */
supplierPortalRouter.post("/onboarding/:id/approve", enforceRBAC('scm_write'), async (req: any, res) => {
    try {
        const reviewerId = req.userId || 'system';
        const supplier = await supplierPortalService.approveRegistration(req.params.id, reviewerId);
        res.json(supplier);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * INTERNAL: Reject a registration request
 */
supplierPortalRouter.post("/onboarding/:id/reject", enforceRBAC('scm_write'), async (req: any, res) => {
    try {
        const reviewerId = req.userId || 'system';
        await supplierPortalService.rejectRegistration(req.params.id, reviewerId, req.body.notes);
        res.sendStatus(200);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * INTERNAL: Generate portal token for existing supplier
 */
supplierPortalRouter.post("/suppliers/:id/generate-token", enforceRBAC('scm_write'), async (req: any, res) => {
    try {
        const { userId } = req.body;
        const identity = await supplierPortalService.generatePortalToken(req.params.id, userId);
        res.json(identity);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

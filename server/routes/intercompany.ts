
import { Router } from "express";
import { intercompanyService } from "../modules/intercompany/intercompany.service";
import { db } from "../db";
import { icOrgs, icTransactionTypes } from "../../shared/schema/intercompany";

import { intercompanyReportService } from "../modules/intercompany/intercompany.report.service";
import { icSecurityService } from "../services/ic-security";

const router = Router();

// 0. Security (Data Access Sets)
router.get("/security/orgs", async (req, res) => {
    try {
        // Assume req.user.id exists from middleware (enforceRBAC)
        // If mocked locally, we can use a header or query param for testing if auth isn't active
        const userId = (req as any).user?.id || (req.headers["x-user-id"] as string) || "test-user";
        const orgs = await icSecurityService.getAuthorizedOrgs(userId);
        res.json(orgs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 1. Get Setup Data
router.get("/setup/orgs", async (req, res) => {
    try {
        const orgs = await db.select().from(icOrgs);
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch IC Orgs" });
    }
});

router.get("/setup/transaction-types", async (req, res) => {
    try {
        const types = await db.select().from(icTransactionTypes);
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Types" });
    }
});

// 2. Batches
router.get("/batches", async (req, res) => {
    try {
        const { initiatorOrgId, role, page, limit } = req.query;
        // Default to "INITIATOR" role if orgId is provided as initiator
        // For simplicity, assume query param 'role'

        // If mocked/test environment
        const orgId = (initiatorOrgId as string) || "ICO-101"; // Default
        const userRole = (role as "INITIATOR" | "RECEIVER") || "INITIATOR";

        const result = await intercompanyService.getBatches(orgId, userRole, Number(page) || 1, Number(limit) || 20);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/batches", async (req, res) => {
    try {
        // Assume req.user.id exists or use mocked
        const userId = "test-user";
        const batch = await intercompanyService.createBatch(req.body, userId);
        res.json(batch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/batches/:id/submit", async (req, res) => {
    try {
        const result = await intercompanyService.submitBatch(req.params.id);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 3. Transactions (Receiver Side)
router.get("/transactions/inbound", async (req, res) => {
    try {
        const { receiverOrgId } = req.query;
        if (!receiverOrgId) return res.status(400).json({ error: "receiverOrgId required" });
        const txns = await intercompanyService.getInboundTransactions(receiverOrgId as string);
        res.json(txns);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/transactions/:id/respond", async (req, res) => {
    try {
        const { action, rejectionReason, receiverLines } = req.body; // action: APPROVE, REJECT
        await intercompanyService.respondToTransaction(req.params.id, action, { rejectionReason, receiverLines });
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/transactions/:id/resubmit", async (req, res) => {
    try {
        const userId = "test-user";
        const newBatch = await intercompanyService.resubmitTransaction(req.params.id, userId);
        res.json(newBatch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});





// 4. Transfer Pricing Rules
router.get("/rules/tp", async (req, res) => {
    try {
        const rules = await intercompanyService.getTransferPricingRules({
            providerOrgId: req.query.providerOrgId as string,
            receiverOrgId: req.query.receiverOrgId as string
        });
        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/rules/tp", async (req, res) => {
    try {
        const rule = await intercompanyService.createTransferPricingRule(req.body);
        res.json(rule);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 5. Mass Allocations
import { allocationService } from "../services/allocations";

router.get("/rules/allocations", async (req, res) => {
    try {
        const rules = await allocationService.getRules();
        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/rules/allocations", async (req, res) => {
    try {
        const rule = await allocationService.createRule(req.body);
        res.json(rule);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/allocations/:id/run", async (req, res) => {
    try {
        // Mock Amount and User for now
        const { amount, currency } = req.body;
        const userId = "test-user";
        const batch = await allocationService.runAllocation(req.params.id, Number(amount), currency, userId);
        res.json(batch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/reports/reconciliation", async (req, res) => {
    try {
        const { period } = req.query;
        const report = await intercompanyReportService.getReconciliationReport(period as string || "All");
        res.json(report);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

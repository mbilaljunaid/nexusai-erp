

import { Router } from "express";
import { intercompanyService } from "../modules/intercompany/intercompany.service";
import { db } from "../db";
import { icOrgs, icTransactionTypes, icDataAccessSets } from "../../shared/schema/intercompany";
import { eq, and } from "drizzle-orm";

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

// User Search (for Data Access UI)
router.get("/users/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || (q as string).length < 3) {
            return res.json([]);
        }

        // Mock user search - in production, this would query the user service
        const mockUsers = [
            { id: "user-001", name: "John Doe", email: "john.doe@example.com" },
            { id: "user-002", name: "Jane Smith", email: "jane.smith@example.com" },
            { id: "user-003", name: "Bob Johnson", email: "bob.johnson@example.com" },
            { id: "user-004", name: "Alice Williams", email: "alice.williams@example.com" }
        ];

        const searchTerm = (q as string).toLowerCase();
        const filtered = mockUsers.filter(u =>
            u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm)
        );

        res.json(filtered);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 1. Get Setup Data
router.get("/orgs", async (req, res) => {
    try {
        const orgs = await db.select({ id: icOrgs.id, org_name: icOrgs.orgName }).from(icOrgs);
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch IC Orgs" });
    }
});

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

// ── Data Access Management ──
router.get("/data-access", async (req, res) => {
    try {
        const sets = await db.select().from(icDataAccessSets);
        res.json(sets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/data-access", async (req, res) => {
    try {
        const { userId, icOrgId, accessLevel } = req.body;

        if (!userId || !icOrgId) {
            return res.status(400).json({ error: "userId and icOrgId are required" });
        }

        // Check for duplicate
        const existing = await db.select().from(icDataAccessSets)
            .where(and(
                eq(icDataAccessSets.userId, userId),
                eq(icDataAccessSets.icOrgId, icOrgId)
            ));

        if (existing.length > 0) {
            return res.status(409).json({ error: "User already has access to this organization" });
        }

        const [newSet] = await db.insert(icDataAccessSets).values({
            userId,
            icOrgId,
            accessLevel: accessLevel || "FULL"
        }).returning();

        res.json(newSet);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/data-access/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(icDataAccessSets).where(eq(icDataAccessSets.id, id));
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ── Disputes Module ──
router.get("/disputes", async (req, res) => {
    try {
        const { status } = req.query;
        // Mock disputes for ICDisputeWorkbench
        const mockDisputes = [
            {
                id: "DISP-1001",
                dispute_number: "DISP-2026-001",
                from_entity: "US Corp",
                to_entity: "UK Subsidiary",
                disputed_amount: 15000,
                currency: "USD",
                status: "Open",
                reason: "AMOUNT_MISMATCH",
                opened_by: "Alice",
                opened_at: new Date().toISOString(),
                events: [{ at: new Date().toISOString(), by: "Alice", action: "OPENED", note: "Initial discrepancy" }]
            }
        ];
        res.json(status ? mockDisputes.filter(d => d.status === status) : mockDisputes);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/disputes/summary", async (req, res) => {
    try {
        res.json([
            { status: "Open", reason: "AMOUNT_MISMATCH", count: 1, total_disputed: 15000 }
        ]);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post("/disputes", async (req, res) => {
    try {
        const newDispute = {
            id: `DISP-${Date.now()}`,
            dispute_number: `DISP-${Date.now()}`,
            ...req.body,
            status: "Open",
            opened_at: new Date().toISOString(),
            events: [{ at: new Date().toISOString(), by: req.body.openedBy || 'System', action: "OPENED", note: req.body.notes || "" }]
        };
        res.json(newDispute);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/disputes/:id/event", async (req, res) => {
    try {
        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/disputes/:id/resolve", async (req, res) => {
    try {
        res.json({ success: true });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// ── Netting Module ──
router.get("/netting/batches", async (req, res) => {
    try {
        // Mock netting batches - in production, query from icNettingBatches table
        const mockBatches = [
            {
                id: "NET-001",
                batchName: "Month-End Netting - Feb 2026",
                status: "PENDING",
                createdDate: new Date("2026-02-10"),
                participatingOrgs: ["ICO-101", "ICO-102", "ICO-103"],
                totalSettlementAmount: 150000,
                currency: "USD"
            },
            {
                id: "NET-002",
                batchName: "Q1 Netting Batch",
                status: "EXECUTED",
                createdDate: new Date("2026-01-31"),
                participatingOrgs: ["ICO-101", "ICO-104"],
                totalSettlementAmount: 85000,
                currency: "USD",
                executedDate: new Date("2026-02-01")
            }
        ];
        res.json(mockBatches);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/netting/batches", async (req, res) => {
    try {
        const { batchName, participatingOrgIds, periodStart, periodEnd, currency } = req.body;

        if (!batchName || !participatingOrgIds || participatingOrgIds.length < 2) {
            return res.status(400).json({ error: "batchName and at least 2 participating orgs required" });
        }

        // Mock netting calculation
        // In production, this would:
        // 1. Query all IC transactions between orgs in the period
        // 2. Calculate bilateral positions
        // 3. Apply multilateral netting algorithm
        // 4. Generate net settlement positions

        const newBatch = {
            id: `NET-${Date.now()}`,
            batchName,
            status: "PENDING",
            createdDate: new Date(),
            participatingOrgs: participatingOrgIds,
            currency: currency || "USD",
            periodStart,
            periodEnd,
            // Mock calculated positions
            positions: participatingOrgIds.map((orgId: string, idx: number) => ({
                orgId,
                grossPayable: (idx + 1) * 50000,
                grossReceivable: (idx + 1) * 45000,
                netPosition: (idx % 2 === 0 ? 1 : -1) * (5000 * (idx + 1))
            })),
            totalSettlementAmount: 0 // Will be calculated
        };

        // Calculate total settlement
        const totalSettlement = newBatch.positions.reduce((sum: number, p: any) =>
            sum + Math.abs(p.netPosition), 0) / 2;
        newBatch.totalSettlementAmount = totalSettlement;

        res.json(newBatch);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/netting/batches/:id/execute", async (req, res) => {
    try {
        const { id } = req.params;

        // In production, this would:
        // 1. Validate batch status is PENDING
        // 2. Create settlement payment transactions
        // 3. Update IC balances
        // 4. Generate GL journals
        // 5. Mark batch as EXECUTED

        const result = {
            batchId: id,
            status: "EXECUTED",
            executedDate: new Date(),
            settlementsCreated: 3,
            message: "Netting batch executed successfully. Settlement transactions created."
        };

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

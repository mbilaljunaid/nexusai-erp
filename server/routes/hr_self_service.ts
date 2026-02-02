import { Router } from "express";
import { db } from "../db";
import { hrPersons, hrAssignments } from "../../shared/schema/hr_worker";
import { hrmPerfGoals, hrmPerfDocuments } from "../../shared/schema/talent_performance";
import { eq, and, sql, inArray } from "drizzle-orm";
import { approvalEngine } from "../workflow/approvalEngine";
import { TimeLaborService } from "../services/TimeLaborService";
import { ManagerAnalyticsService } from "../services/ManagerAnalyticsService";
import { AIQueryService } from "../services/AIQueryService";

const router = Router();

// GET /api/hr/organization/chart
// Simple organizational chart (hierarchical)
router.get("/organization/chart", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";

        // Fetch all active assignments with person details
        const results = await db.select({
            personId: hrPersons.id,
            name: sql<string>`${hrPersons.firstName} || ' ' || ${hrPersons.lastName}`,
            role: sql<string>`COALESCE(${hrAssignments.assignmentNumber}, 'Employee')`,
            managerId: hrAssignments.managerId
        })
            .from(hrAssignments)
            .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .where(eq(hrAssignments.tenantId, tenantId));

        // Build hierarchy
        const buildTree = (managerId: string | null): any[] => {
            return results
                .filter(r => r.managerId === managerId)
                .map(r => ({
                    ...r,
                    children: buildTree(r.personId)
                }));
        };

        // Find roots (where managerId is null or not in the person list)
        const personIds = new Set(results.map(r => r.personId));
        const roots = results.filter(r => !r.managerId || !personIds.has(r.managerId));

        // Enhance roots if they have a managerId that is not null but not in list
        const tree = roots.map(r => ({
            ...r,
            children: buildTree(r.personId)
        }));

        res.json(tree);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr/team/performance
// Performance summary for a manager's direct reports
router.get("/team/performance", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const managerId = req.query.managerId || req.user?.id;

        if (!managerId) {
            return res.status(400).json({ error: "Manager ID required" });
        }

        // Get direct reports
        const directs = await db.select({
            id: hrPersons.id,
            name: sql<string>`${hrPersons.firstName} || ' ' || ${hrPersons.lastName}`
        })
            .from(hrAssignments)
            .innerJoin(hrPersons, eq(hrAssignments.personId, hrPersons.id))
            .where(and(
                eq(hrAssignments.tenantId, tenantId),
                eq(hrAssignments.managerId, managerId)
            ));

        const directIds = directs.map(d => d.id);
        if (directIds.length === 0) {
            return res.json([]);
        }

        // Get goals and documents for these directs
        const goals = await db.select().from(hrmPerfGoals).where(sql`${hrmPerfGoals.personId} IN ${directIds}`);
        const docs = await db.select().from(hrmPerfDocuments).where(sql`${hrmPerfDocuments.personId} IN ${directIds}`);

        const summary = directs.map(d => {
            const personGoals = goals.filter(g => g.personId === d.id);
            const personDocs = docs.filter(doc => doc.personId === d.id);
            const latestDoc = personDocs.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))[0];

            const completedGoals = personGoals.filter(g => g.status === "COMPLETED").length;
            const totalGoals = personGoals.length;

            return {
                personId: d.id,
                name: d.name,
                goalsCount: totalGoals,
                goalsCompletion: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
                rating: latestDoc?.overallRating || "N/A",
                status: latestDoc?.status || "No Review"
            };
        });

        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr/manager-actions/promote
router.post("/manager-actions/promote", async (req: any, res) => {
    try {
        const { personId, newGradeId, newJobId, effectiveDate, justification } = req.body;
        const managerId = req.user.id;
        const tenantId = req.user.tenantId || "default";

        // Create approval request
        const request = await approvalEngine.createRequest({
            tenantId,
            formId: "PROMOTION_ACTION",
            recordId: personId,
            requestedBy: managerId,
            requiredApprovals: 2, // Line Manager + HR
            approvers: [
                { userId: "hr_admin", approved: false }, // Dynamic in real app
                { userId: "global_admin", approved: false }
            ],
            payload: {
                type: "PROMOTION",
                newGradeId,
                newJobId,
                effectiveDate,
                justification
            }
        });

        res.json({ success: true, requestId: request.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/manager-actions/transfer
router.post("/manager-actions/transfer", async (req: any, res) => {
    try {
        const { personId, newDepartmentId, newLocationId, effectiveDate, justification } = req.body;
        const managerId = req.user.id;
        const tenantId = req.user.tenantId || "default";

        // Create approval request
        const request = await approvalEngine.createRequest({
            tenantId,
            formId: "TRANSFER_ACTION",
            recordId: personId,
            requestedBy: managerId,
            requiredApprovals: 2,
            approvers: [
                { userId: "hr_admin", approved: false },
                { userId: "global_admin", approved: false }
            ],
            payload: {
                type: "TRANSFER",
                newDepartmentId,
                newLocationId,
                effectiveDate,
                justification
            }
        });

        res.json({ success: true, requestId: request.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/ess-actions/marital-status
router.post("/ess-actions/marital-status", async (req: any, res) => {
    try {
        const { newStatus, justification } = req.body;
        const personId = req.user.id;
        const tenantId = req.user.tenantId || "default";

        const request = await approvalEngine.createRequest({
            tenantId,
            formId: "MARITAL_STATUS_CHANGE",
            recordId: personId,
            requestedBy: personId,
            requiredApprovals: 1,
            approvers: [
                { userId: "hr_admin", approved: false }
            ],
            payload: {
                type: "MARITAL_STATUS",
                newStatus,
                justification
            }
        });

        res.json({ success: true, requestId: request.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/ess-actions/address-change
router.post("/ess-actions/address-change", async (req: any, res) => {
    try {
        const { newAddress, justification } = req.body;
        const personId = req.user.id;
        const tenantId = req.user.tenantId || "default";

        const request = await approvalEngine.createRequest({
            tenantId,
            formId: "ADDRESS_CHANGE",
            recordId: personId,
            requestedBy: personId,
            requiredApprovals: 1,
            approvers: [
                { userId: "hr_admin", approved: false }
            ],
            payload: {
                type: "ADDRESS",
                newAddress,
                justification
            }
        });

        res.json({ success: true, requestId: request.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/ess-actions/emergency-contacts
router.post("/ess-actions/emergency-contacts", async (req: any, res) => {
    try {
        const { contacts } = req.body; // Array of contact objects
        const personId = req.user.id;
        const tenantId = req.user.tenantId || "default";

        // Logic here would ideally be a direct update or a lightweight approval
        // For now, we wrap it in a notification-only workflow or direct update
        // We'll stick to direct persistence if no sensitive data, but usually needs HR review in Fusion
        const request = await approvalEngine.createRequest({
            tenantId,
            formId: "EMERGENCY_CONTACT_UPDATE",
            recordId: personId,
            requestedBy: personId,
            requiredApprovals: 1,
            approvers: [
                { userId: "hr_admin", approved: false }
            ],
            payload: {
                type: "EMERGENCY_CONTACTS",
                contacts
            }
        });

        res.json({ success: true, requestId: request.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/team/analytics
router.get("/team/analytics", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const managerId = req.query.managerId || req.user?.id;

        if (!managerId) {
            return res.status(400).json({ error: "Manager ID required" });
        }

        const metrics = await ManagerAnalyticsService.getTeamMetrics(managerId, tenantId);
        const skillGaps = await ManagerAnalyticsService.getSkillGaps(managerId, tenantId);

        res.json({
            metrics,
            skillGaps
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ================= ESS / ME ROUTES (PHASE 1) =================

// Helper for PersonId
const getPersonId = async (req: any) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenantId || "default";
    return await TimeLaborService.getPersonIdForUser(userId, tenantId);
};

// GET /api/hr-self-service/me/time-periods
router.get("/me/time-periods", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        res.json(periods);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/timesheets
router.get("/me/timesheets", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const personId = await getPersonId(req);
        const { periodId } = req.query;

        if (!personId || !periodId) {
            return res.status(400).json({ error: "Person ID or Period ID missing" });
        }

        const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, personId, periodId as string);
        const fullSheet = await TimeLaborService.getTimesheet(sheet.id);
        res.json(fullSheet);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/timesheets/:id/entries
router.post("/me/timesheets/:id/entries", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const personId = await getPersonId(req);
        const timesheetId = req.params.id;

        // Verify ownership
        const sheet = await TimeLaborService.getTimesheet(timesheetId);
        if (sheet.personId !== personId) {
            return res.status(403).json({ error: "Forbidden: Not your timesheet" });
        }

        const entry = await TimeLaborService.logTime({
            ...req.body,
            tenantId,
            timesheetId
        });
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/absences/balances
router.get("/me/absences/balances", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const personId = await getPersonId(req);
        if (!personId) return res.status(400).json({ error: "Person link missing" });

        const balances = await TimeLaborService.getLeaveBalances(tenantId, personId);
        res.json(balances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/absences/history
router.get("/me/absences/history", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const personId = await getPersonId(req);
        if (!personId) return res.status(400).json({ error: "Person link missing" });

        const history = await TimeLaborService.getAbsenceHistory(tenantId, personId);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/ai/nudges
router.get("/me/ai/nudges", async (req: any, res) => {
    try {
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!personId) return res.status(404).json({ error: "Person record not found" });

        const nudges = await AIQueryService.getQuickNudges(personId, tenantId);
        res.json(nudges);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/ai/chat
router.post("/me/ai/chat", async (req: any, res) => {
    try {
        const { message } = req.body;
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";

        if (!personId) return res.status(404).json({ error: "Person record not found" });
        if (!message) return res.status(400).json({ error: "Message is required" });

        const response = await AIQueryService.processQuery(message, personId, tenantId);
        res.json({ response });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

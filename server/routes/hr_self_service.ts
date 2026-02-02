import { Router } from "express";
import { db } from "../db";
import { hrPersons, hrAssignments } from "../../shared/schema/hr_worker";
import { hrDocuments } from "../../shared/schema/hr_documents";
import { hrmPerfGoals, hrmPerfDocuments } from "../../shared/schema/talent_performance";
import { eq, and, sql, inArray } from "drizzle-orm";
import { approvalEngine } from "../workflow/approvalEngine";
import { TimeLaborService } from "../services/TimeLaborService";
import { ManagerAnalyticsService } from "../services/ManagerAnalyticsService";
import { AIQueryService } from "../services/AIQueryService";
import { DelegationService } from "../services/DelegationService";
import { PayrollService } from "../services/PayrollService";
import { hrmPayElements } from "../../shared/schema/rewards_payroll";

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

const getAssignmentId = async (req: any) => {
    const personId = await getPersonId(req);
    if (!personId) return null;
    const tenantId = req.user?.tenantId || "default";
    const [assignment] = await db.select().from(hrAssignments)
        .where(and(
            eq(hrAssignments.personId, personId),
            eq(hrAssignments.tenantId, tenantId)
        ))
        .limit(1);
    return assignment?.id || null;
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

// === DELEGATION (PROXY) API ===

// GET /api/hr-self-service/me/delegation
router.get("/me/delegation", async (req: any, res) => {
    try {
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!personId) return res.status(404).json({ error: "Person record not found" });

        const proxies = await DelegationService.getActiveProxiesForManager(personId, tenantId);
        res.json(proxies);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/delegation
router.post("/me/delegation", async (req: any, res) => {
    try {
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!personId) return res.status(404).json({ error: "Person record not found" });

        const proxy = await DelegationService.createProxy({
            ...req.body,
            managerId: personId,
            tenantId
        });
        res.json(proxy);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/hr-self-service/me/delegation/:id
router.delete("/me/delegation/:id", async (req: any, res) => {
    try {
        const proxy = await DelegationService.revokeProxy(req.params.id);
        res.json(proxy);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/eligible-proxies
router.get("/eligible-proxies", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        const personId = await getPersonId(req);

        // List all other people in the same tenant
        const others = await db.select({
            id: hrPersons.id,
            name: sql<string>`${hrPersons.firstName} || ' ' || ${hrPersons.lastName}`,
            email: hrPersons.email
        })
            .from(hrPersons)
            .where(and(
                eq(hrPersons.tenantId, tenantId),
                personId ? sql`${hrPersons.id} != ${personId}` : sql`true`
            ));

        res.json(others);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/payroll/deductions
router.get("/me/payroll/deductions", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const deductions = await PayrollService.getVoluntaryDeductions(assignmentId, tenantId);
        res.json(deductions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/payroll/deductions
router.post("/me/payroll/deductions", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const deduction = await PayrollService.createVoluntaryDeduction({
            ...req.body,
            assignmentId,
            tenantId
        });
        res.json(deduction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/hr-self-service/me/payroll/deductions/:id
router.delete("/me/payroll/deductions/:id", async (req: any, res) => {
    try {
        const deduction = await PayrollService.deleteVoluntaryDeduction(req.params.id);
        res.json(deduction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/payroll/retro-pay
router.get("/me/payroll/retro-pay", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const history = await PayrollService.getRetroPayHistory(assignmentId, tenantId);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/payroll/eligible-elements
router.get("/payroll/eligible-elements", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        // List only voluntary deduction elements
        const elements = await db.select()
            .from(hrmPayElements)
            .where(and(
                eq(hrmPayElements.tenantId, tenantId),
                eq(hrmPayElements.classification, "DEDUCTION")
                // In real app, we might filter by 'VOLUNTARY' flag if it existed
            ));
        res.json(elements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/payroll/deductions
router.get("/me/payroll/deductions", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const deductions = await PayrollService.getVoluntaryDeductions(assignmentId, tenantId);
        res.json(deductions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/payroll/deductions
router.post("/me/payroll/deductions", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const deduction = await PayrollService.createVoluntaryDeduction({
            ...req.body,
            assignmentId,
            tenantId
        });
        res.json(deduction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/hr-self-service/me/payroll/deductions/:id
router.delete("/me/payroll/deductions/:id", async (req: any, res) => {
    try {
        const deduction = await PayrollService.deleteVoluntaryDeduction(req.params.id);
        res.json(deduction);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/payroll/retro-pay
router.get("/me/payroll/retro-pay", async (req: any, res) => {
    try {
        const assignmentId = await getAssignmentId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!assignmentId) return res.status(404).json({ error: "Assignment not found" });

        const history = await PayrollService.getRetroPayHistory(assignmentId, tenantId);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/payroll/eligible-elements
router.get("/payroll/eligible-elements", async (req: any, res) => {
    try {
        const tenantId = req.user?.tenantId || "default";
        // List only voluntary deduction elements
        const elements = await db.select()
            .from(hrmPayElements)
            .where(and(
                eq(hrmPayElements.tenantId, tenantId),
                eq(hrmPayElements.classification, "DEDUCTION")
            ));
        res.json(elements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/hr-self-service/me/compliance/forms
router.get("/me/compliance/forms", async (req: any, res) => {
    try {
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!personId) return res.status(404).json({ error: "Person not found" });

        const docs = await db.select().from(hrDocuments)
            .where(and(
                eq(hrDocuments.personId, personId),
                eq(hrDocuments.tenantId, tenantId),
                inArray(hrDocuments.documentType, ["TAX_FORM", "STATUTORY_FORM", "COMPLIANCE_FORM"])
            ));
        res.json(docs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/hr-self-service/me/compliance/forms
router.post("/me/compliance/forms", async (req: any, res) => {
    try {
        const personId = await getPersonId(req);
        const tenantId = req.user?.tenantId || "default";
        if (!personId) return res.status(404).json({ error: "Person not found" });

        const [doc] = await db.insert(hrDocuments).values({
            ...req.body,
            personId,
            tenantId,
            createdBy: req.user.id
        }).returning();
        res.json(doc);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

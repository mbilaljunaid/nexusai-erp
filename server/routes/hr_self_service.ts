import { Router } from "express";
import { db } from "../db";
import { hrPersons, hrAssignments } from "../../shared/schema/hr_worker";
import { hrmPerfGoals, hrmPerfDocuments } from "../../shared/schema/talent_performance";
import { eq, and, sql } from "drizzle-orm";
import { approvalEngine } from "../workflow/approvalEngine";

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

export default router;

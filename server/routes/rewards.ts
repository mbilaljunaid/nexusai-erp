import { db } from "../db";
import { hrmPayrollRuns, hrmPayrollRunResults } from "@shared/schema/rewards_payroll";
import { eq, inArray, desc, and } from "drizzle-orm";
import { CompensationService } from "../services/CompensationService";
import { PayrollService } from "../services/PayrollService";
import { PdfService } from "../services/PdfService";
import { BenefitsService } from "../services/BenefitsService";
import { hrPersons, hrAssignments } from "@shared/schema/hr_worker";

const router = Router();

// Helper to get personId for logged in user
const getPersonIdForUser = async (req: any) => {
    const userId = req.user?.id || req.session?.userId;
    const tenantId = req.user?.tenantId || "default_tenant";
    if (!userId) return null;
    const [person] = await db.select().from(hrPersons)
        .where(and(eq(hrPersons.userId, userId), eq(hrPersons.tenantId, tenantId)));
    return person?.id;
};

// ================= COMPENSATION =================

router.get("/rewards/salary-bases", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const bases = await CompensationService.getSalaryBases(tenantId);
        res.json(bases);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/rewards/salary-bases", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const basis = await CompensationService.createSalaryBasis(data);
        res.status(201).json(basis);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Worker Salary
router.get("/rewards/worker-salary/:assignmentId", async (req, res) => {
    try {
        const userRole = (req as any).user?.role || "EMPLOYEE";
        // Only HR_ADMIN and MANAGER can see raw salary data.
        const shouldMask = !["HR_ADMIN", "MANAGER"].includes(userRole);

        const salary = await CompensationService.getWorkerSalary(req.params.assignmentId, new Date(), { mask: shouldMask });
        res.json(salary);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/rewards/worker-salary", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const salary = await CompensationService.assignSalary(data);
        res.status(201).json(salary);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// ================= PAYROLL =================

router.get("/rewards/pay-groups", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const groups = await PayrollService.getPayGroups(tenantId);
        res.json(groups);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/rewards/elements", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const elems = await PayrollService.getElements(tenantId);
        res.json(elems);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/rewards/elements", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const elem = await PayrollService.createElement(data);
        res.status(201).json(elem);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Payroll Runs
router.get("/rewards/payroll-runs", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const runs = await PayrollService.getRuns(tenantId);
        res.json(runs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/rewards/payroll-runs", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const run = await PayrollService.createRun(data);
        res.status(201).json(run);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Calculate Action
router.post("/rewards/payroll-runs/:id/calculate", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const result = await PayrollService.calculateRun(req.params.id, tenantId);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

import { PayrollAnalyticsService } from "../services/PayrollAnalyticsService";

router.get("/rewards/payroll-runs/:id/anomalies", async (req, res) => {
    try {
        const anomalies = await PayrollAnalyticsService.detectAnomalies(req.params.id);
        res.json(anomalies);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/rewards/payroll-runs/:id/approve", async (req, res) => {
    try {
        const userId = (req as any).user?.id || "admin";
        const result = await PayrollService.approveRun(req.params.id, userId);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/rewards/payroll-runs/:id/results", async (req, res) => {
    try {
        const results = await PayrollService.getRunResults(req.params.id);
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ================= EMPLOYEE SELF-SERVICE =================

// Get My Payslips (List)
router.get("/me/payslips", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const personId = await getPersonIdForUser(req);

        if (!personId) return res.json([]);

        // Find assignments for this person
        const personAssignments = await db.select({ id: hrAssignments.id }).from(hrAssignments).where(eq(hrAssignments.personId, personId));
        const assignmentIds = personAssignments.map(a => a.id);

        if (assignmentIds.length === 0) return res.json([]);

        // Find runs that have results for these assignments
        const results = await db.select({ runId: hrmPayrollRunResults.payrollRunId })
            .from(hrmPayrollRunResults)
            .where(inArray(hrmPayrollRunResults.assignmentId, assignmentIds));

        const runIds = [...new Set(results.map(r => r.runId))];

        if (runIds.length === 0) return res.json([]);

        const runs = await db.select().from(hrmPayrollRuns)
            .where(and(
                eq(hrmPayrollRuns.tenantId, tenantId),
                inArray(hrmPayrollRuns.id, runIds)
            ))
            .orderBy(desc(hrmPayrollRuns.periodStartDate));

        res.json(runs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Payslip Detail
router.get("/me/payslips/:runId", async (req, res) => {
    try {
        const personId = await getPersonIdForUser(req);
        if (!personId) return res.status(401).json({ error: "Unauthorized" });

        const personAssignments = await db.select({ id: hrAssignments.id }).from(hrAssignments).where(eq(hrAssignments.personId, personId));
        const assignmentIds = personAssignments.map(a => a.id);

        if (assignmentIds.length === 0) return res.json([]);

        const results = await db.select()
            .from(hrmPayrollRunResults)
            .where(and(
                eq(hrmPayrollRunResults.payrollRunId, req.params.runId),
                inArray(hrmPayrollRunResults.assignmentId, assignmentIds)
            ));

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ================= BENEFITS =================

router.get("/me/benefits/active", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const personId = await getPersonIdForUser(req);
        if (!personId) return res.status(401).json({ error: "Unauthorized" });

        const enrollments = await BenefitsService.getActiveEnrollments(personId, tenantId);
        res.json(enrollments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/me/benefits/programs/open", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const programs = await BenefitsService.getOpenPrograms(tenantId);
        res.json(programs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/me/benefits/programs/:programId/plans", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const plans = await BenefitsService.getProgramPlans(req.params.programId, tenantId);
        res.json(plans);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/me/benefits/enroll", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const personId = await getPersonIdForUser(req);
        if (!personId) return res.status(401).json({ error: "Unauthorized" });

        const { planOptionId, startDate } = req.body;
        const result = await BenefitsService.processEnrollment(personId, tenantId, planOptionId, startDate);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

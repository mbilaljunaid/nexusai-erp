import { Router } from "express";
import { db } from "../db";
import { hrmPayrollRuns, hrmPayrollRunResults } from "@shared/schema/rewards_payroll";
import { eq, inArray, desc } from "drizzle-orm";
import { CompensationService } from "../services/CompensationService";
import { CompensationService } from "../services/CompensationService";
import { PayrollService } from "../services/PayrollService";
import { PdfService } from "../services/PdfService";
import { hrPersons, hrAssignments } from "@shared/schema/hr_worker";
import { hrmPayrollRuns } from "@shared/schema/rewards_payroll";

const router = Router();

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
        // In real app, derived from req.user -> Person
        // For V1 Demo, we fetch all completed runs where we have a result for ANY user (or specifically 'John Payroll' if we had context)
        // Let's just return all COMPLETED runs for the tenant to populate the UI for the demo user.
        const tenantId = (req as any).user?.tenantId || "default_tenant";

        const runs = await db.select().from(hrmPayrollRuns)
            .where(eq(hrmPayrollRuns.tenantId, tenantId))
            .orderBy(desc(hrmPayrollRuns.periodStartDate));

        // Filter out Open/Calculating runs? Usually only Paid/Completed shown.
        const completedRuns = runs.filter(r => r.status === 'COMPLETED' || r.status === 'PAID');

        res.json(completedRuns);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Payslip Detail
router.get("/me/payslips/:runId", async (req, res) => {
    try {
        // Fetch results for this run. In real app, filter by req.user.personId
        const results = await PayrollService.getRunResults(req.params.runId);
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Download PDF
router.get("/me/payslips/:runId/pdf", async (req, res) => {
    try {
        const runId = req.params.runId;
        const results = await PayrollService.getRunResults(runId);
        const [run] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, runId));

        if (!run || results.length === 0) return res.status(404).send("Payslip not found");

        // Fetch Employee Info (assuming first result belongs to the user for this 'me' route simulation)
        // In real app we use req.user.personId to find THEIR results only.
        const assignmentId = results[0].assignmentId;
        let employeeName = "Valued Employee";
        let employeeId = "EMP-001";

        if (assignmentId) {
            const [assignment] = await db.select().from(hrAssignments).where(eq(hrAssignments.id, assignmentId));
            if (assignment) {
                const [person] = await db.select().from(hrPersons).where(eq(hrPersons.id, assignment.personId));
                if (person) {
                    employeeName = `${person.firstName} ${person.lastName}`;
                    employeeId = person.personNumber || "EMP-001";
                }
            }
        }

        const earnings = results.filter(r => !r.elementName.includes("Tax") && !r.elementName.includes("Insurance"));
        const deductions = results.filter(r => r.elementName.includes("Tax") || r.elementName.includes("Insurance"));

        const totalEarnings = earnings.reduce((a, b) => a + Number(b.amount), 0);
        const totalDeductions = deductions.reduce((a, b) => a + Math.abs(Number(b.amount)), 0);
        const netPay = totalEarnings - totalDeductions;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=payslip-${run.periodName}.pdf`);

        await PdfService.generatePayslip(res, {
            employeeName,
            employeeId,
            payPeriod: run.periodName,
            paymentDate: run.paymentDate || new Date().toISOString(),
            earnings,
            deductions,
            netPay
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;

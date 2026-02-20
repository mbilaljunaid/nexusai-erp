// @ts-nocheck
import { Express } from "express";
import { absenceService } from "./absence.service";
import { payrollElementService } from "./payroll-element.service";
import { multiCountryPayrollService } from "./multi-country-payroll.service";
import { payrollGLCostingService } from "./payroll-gl-costing.service";
import { statutoryPaymentFileService } from "./statutory-payment-file.service";
import { compensationWorkbenchService } from "./compensation-workbench.service";
import { benefitsEnrollmentService } from "./benefits-enrollment.service";
import { payslipService } from "./payslip.service";

export function registerHRComplianceRoutes(app: Express) {

    // ─── Absence ──────────────────────────────────────────────────────────────
    app.post("/api/hr/absence/types", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const type = await absenceService.createAbsenceType({ ...req.body, tenantId });
            res.status(201).json(type);
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/absence/types", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await absenceService.getTypes(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/absence/accrue", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await absenceService.runAccrual({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/absence/balance/:employeeId/:year", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await absenceService.getBalance(tenantId, req.params.employeeId, parseInt(req.params.year)));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/absence/requests", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await absenceService.submitRequest({ ...req.body, tenantId }));
        } catch (e: any) { res.status(400).json({ error: e.message }); }
    });

    app.post("/api/hr/absence/requests/:id/approve", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await absenceService.approveRequest(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/absence/requests/:id/reject", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await absenceService.rejectRequest(req.params.id, userId, req.body.reason));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/absence/requests", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await absenceService.listRequests(tenantId, req.query.employeeId as string, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Payroll Elements ────────────────────────────────────────────────────
    app.post("/api/hr/payroll/elements", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await payrollElementService.createElement({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/payroll/elements", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await payrollElementService.getElements(tenantId, req.query.countryCode as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/elements/entries", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await payrollElementService.setEmployeeEntry({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Payroll Runs ─────────────────────────────────────────────────────────
    app.post("/api/hr/payroll/runs", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const processedBy = (req.user as any)?.id || "system";
            res.status(201).json(await multiCountryPayrollService.createRun({ ...req.body, tenantId, processedBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/payroll/runs", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await multiCountryPayrollService.listRuns(tenantId, req.query.countryCode as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/runs/:id/process", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await multiCountryPayrollService.processRun(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/runs/:id/approve", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await multiCountryPayrollService.approveRun(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/runs/:id/reverse", async (req, res) => {
        try {
            res.json(await multiCountryPayrollService.reverseRun(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/payroll/runs/:id/results", async (req, res) => {
        try {
            res.json(await multiCountryPayrollService.getRunResults(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/runs/:id/post-gl", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await payrollGLCostingService.postCostingJournal(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Payslips ─────────────────────────────────────────────────────────────
    app.get("/api/hr/payroll/runs/:id/payslips", async (req, res) => {
        try {
            res.json(await payslipService.generatePayslips(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/payroll/runs/:runId/payslips/:employeeId/html", async (req, res) => {
        try {
            const payslips = await payslipService.generatePayslips(req.params.runId);
            const payslip = payslips.find(p => p.employeeId === req.params.employeeId);
            if (!payslip) return res.status(404).json({ error: 'Payslip not found' });
            res.setHeader('Content-Type', 'text/html');
            res.send(payslipService.renderPayslipHTML(payslip));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Statutory Payment Files ──────────────────────────────────────────────
    app.post("/api/hr/payroll/payment-files", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const generatedBy = (req.user as any)?.id || "system";
            res.status(201).json(await statutoryPaymentFileService.generateFile({ ...req.body, tenantId, generatedBy }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/payroll/payment-files", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await statutoryPaymentFileService.getFiles(tenantId, req.query.runId as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/payroll/payment-files/:id/submit", async (req, res) => {
        try {
            res.json(await statutoryPaymentFileService.markSubmitted(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Compensation Workbench ───────────────────────────────────────────────
    app.post("/api/hr/compensation/plans", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await compensationWorkbenchService.createPlan({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/compensation/plans", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await compensationWorkbenchService.listPlans(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/compensation/plans/:id/proposals", async (req, res) => {
        try {
            res.json(await compensationWorkbenchService.getPlanProposals(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/compensation/plans/:id/budget", async (req, res) => {
        try {
            res.json(await compensationWorkbenchService.getBudgetSummary(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/compensation/proposals", async (req, res) => {
        try {
            res.status(201).json(await compensationWorkbenchService.submitProposal(req.body));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/compensation/proposals/:id/approve", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await compensationWorkbenchService.approveProposal(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/compensation/plans/:id/apply", async (req, res) => {
        try {
            const userId = (req.user as any)?.id || "system";
            res.json(await compensationWorkbenchService.applyPlan(req.params.id, userId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Benefits Enrollment ──────────────────────────────────────────────────
    app.post("/api/hr/benefits/plans", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await benefitsEnrollmentService.createPlan({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/benefits/plans", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await benefitsEnrollmentService.getAvailablePlans(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/benefits/enroll", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await benefitsEnrollmentService.enroll({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/benefits/waive", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await benefitsEnrollmentService.waiveCoverage(tenantId, req.body.employeeId, req.body.planId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/benefits/enrollments/:id/terminate", async (req, res) => {
        try {
            res.json(await benefitsEnrollmentService.terminateEnrollment(req.params.id, req.body.effectiveTo));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/benefits/employees/:employeeId/enrollments", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await benefitsEnrollmentService.getEmployeeEnrollments(tenantId, req.params.employeeId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/benefits/summary", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await benefitsEnrollmentService.getTenantSummary(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── P1-F: FLSA Overtime ──────────────────────────────────────────────────
    app.post("/api/hr/wfm/overtime-rules", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await flsaOvertimeService.createRule({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/wfm/overtime-rules", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await flsaOvertimeService.listRules(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/wfm/timecards", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.status(201).json(await flsaOvertimeService.calculateTimecard({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/wfm/timecards/:employeeId", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await flsaOvertimeService.getTimecards(tenantId, req.params.employeeId, req.query.from as string, req.query.to as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/wfm/weekly-summary", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await flsaOvertimeService.buildWeeklySummary({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/wfm/overtime-report", async (req, res) => {
        try {
            const { flsaOvertimeService } = await import("./flsa-overtime.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await flsaOvertimeService.getOvertimeReport(tenantId, req.query.weekStartDate as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── P1-F: Predictive Scheduling ─────────────────────────────────────────
    app.post("/api/hr/wfm/forecast", async (req, res) => {
        try {
            const { predictiveSchedulingService } = await import("./predictive-scheduling.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await predictiveSchedulingService.generateForecast({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/wfm/schedule/generate", async (req, res) => {
        try {
            const { predictiveSchedulingService } = await import("./predictive-scheduling.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await predictiveSchedulingService.generateSchedule({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/hr/wfm/schedule/publish", async (req, res) => {
        try {
            const { predictiveSchedulingService } = await import("./predictive-scheduling.service");
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            res.json(await predictiveSchedulingService.publishSchedule(tenantId, req.body.locationId, req.body.weekStartDate));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/wfm/schedule", async (req, res) => {
        try {
            const { predictiveSchedulingService } = await import("./predictive-scheduling.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await predictiveSchedulingService.getSchedule(tenantId, req.query.locationId as string, req.query.startDate as string, req.query.endDate as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/hr/wfm/coverage", async (req, res) => {
        try {
            const { predictiveSchedulingService } = await import("./predictive-scheduling.service");
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            res.json(await predictiveSchedulingService.getCoverage(tenantId, req.query.locationId as string, req.query.date as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}


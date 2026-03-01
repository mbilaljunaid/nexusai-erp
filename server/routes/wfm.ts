
import { Router } from "express";
import { TimeLaborService } from "../services/TimeLaborService";
import { TimeAIService } from "../services/TimeAIService";

const router = Router();

// 1. Time Periods
router.post("/time-periods", async (req, res) => {
    try {
        const { tenantId, name, startDate, endDate } = req.body;
        const period = await TimeLaborService.createTimePeriod(tenantId, name, startDate, endDate);
        res.json(period);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/time-periods", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || req.query.tenantId as string || "default_tenant";
        const periods = await TimeLaborService.getOpenPeriods(tenantId);
        res.json(periods);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Timesheets
router.get("/timesheets", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || req.query.tenantId as string || "default_tenant";
        const { personId, periodId } = req.query;
        const legalEntityId = req.headers['x-legal-entity-id'] || req.query.legalEntityId as string;

        if (personId && periodId) {
            const sheet = await TimeLaborService.getOrCreateTimesheet(tenantId, personId as string, periodId as string, legalEntityId);
            // Fetch full details
            const fullSheet = await TimeLaborService.getTimesheet(sheet.id);
            res.json(fullSheet);
        } else {
            res.status(400).json({ error: "Missing personId or periodId" });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/timesheets/:id", async (req, res) => {
    try {
        const sheet = await TimeLaborService.getTimesheet(req.params.id);
        res.json(sheet);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// 3. Time Entries
router.post("/entries", async (req, res) => {
    try {
        const entry = await TimeLaborService.logTime(req.body);
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Shifts (Definitions)
router.post("/shifts", async (req, res) => {
    try {
        // tenantId from body or middleware in real app
        const { tenantId, ...data } = req.body;
        const shift = await TimeLaborService.createShift(tenantId, data);
        res.json(shift);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/shifts", async (req, res) => {
    try {
        const { tenantId } = req.query;
        const shifts = await TimeLaborService.getShifts(tenantId as string);
        res.json(shifts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Schedule (Assignments)
router.post("/schedule/assign", async (req, res) => {
    try {
        const { tenantId, personId, shiftId, date } = req.body;
        const assignment = await TimeLaborService.assignShift(tenantId, personId, shiftId, date);
        res.json(assignment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/schedule/team", async (req, res) => {
    try {
        const { tenantId } = req.query;
        const schedule = await TimeLaborService.getTeamSchedule(tenantId as string);
        res.json(schedule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/schedule", async (req, res) => {
    try {
        const { tenantId, personId, from, to } = req.query;
        const schedule = await TimeLaborService.getSchedule(tenantId as string, personId as string, from as string, to as string);
        res.json(schedule);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Approvals
router.post("/timesheets/:id/submit", async (req, res) => {
    try {
        const sheet = await TimeLaborService.submitTimesheet(req.params.id);
        res.json(sheet);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/timesheets/:id/approve", async (req, res) => {
    try {
        const { approverId } = req.body;
        const sheet = await TimeLaborService.approveTimesheet(req.params.id, approverId);
        res.json(sheet);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/timesheets/:id/reject", async (req, res) => {
    try {
        const { reason } = req.body;
        const sheet = await TimeLaborService.rejectTimesheet(req.params.id, reason);
        res.json(sheet);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/approvals/pending", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || req.query.tenantId as string || "default_tenant";
        const legalEntityId = req.headers['x-legal-entity-id'] || req.query.legalEntityId as string;
        const sheets = await TimeLaborService.getPendingTimesheets(tenantId, legalEntityId);
        res.json(sheets);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Payroll Integration
router.post("/payroll/transfer", async (req, res) => {
    try {
        const { tenantId, periodId, userId } = req.body;
        const result = await TimeLaborService.transferToPayroll(tenantId, periodId, userId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/payroll/batches", async (req, res) => {
    try {
        const { tenantId } = req.query;
        const batches = await TimeLaborService.getPayrollBatches(tenantId as string);
        res.json(batches);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Timekeeper & Bulk Entry
router.get("/daily-status", async (req, res) => {
    try {
        const { tenantId, date } = req.query;
        const status = await TimeLaborService.getDailyStatus(tenantId as string, date as string);
        res.json(status);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/bulk-entries", async (req, res) => {
    try {
        const { tenantId, date, entries } = req.body;
        const results = await TimeLaborService.bulkUpsertEntries(tenantId, date, entries);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Violations
router.get("/violations", async (req, res) => {
    try {
        const { tenantId } = req.query;
        const violations = await TimeLaborService.getViolations(tenantId as string);
        res.json(violations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Analytics
router.get("/analytics", async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || req.query.tenantId as string || "default_tenant";
        const legalEntityId = req.headers['x-legal-entity-id'] || req.query.legalEntityId as string;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Missing date range" });
        }
        const metrics = await TimeLaborService.getLaborMetrics(tenantId, startDate as string, endDate as string, legalEntityId);
        res.json(metrics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 10. Accruals
router.get("/balances/:personId", async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: "Missing tenantId" });
        const balances = await TimeLaborService.getLeaveBalances(tenantId as string, req.params.personId);
        res.json(balances);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/accruals", async (req, res) => {
    try {
        const { tenantId, personId, leaveType, hours } = req.body;
        const result = await TimeLaborService.addAccrual(tenantId, personId, leaveType, hours);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/accruals/cycle", async (req, res) => {
    try {
        const { tenantId } = req.body;
        if (!tenantId) return res.status(400).json({ error: "Missing tenantId" });
        const result = await TimeLaborService.runAccrualCycle(tenantId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});



// 12. Regional Policies
router.post("/policies/regional", async (req, res) => {
    try {
        const { tenantId, countryCode, standardWeeklyHours, standardDailyHours, overtimeMultiplier } = req.body;
        const result = await TimeLaborService.configureRegionalPolicy(
            tenantId,
            countryCode,
            Number(standardWeeklyHours),
            Number(standardDailyHours),
            Number(overtimeMultiplier)
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// 13. Labor Intelligence (AI)
router.get("/ai/forecast", async (req, res) => {
    try {
        const { tenantId, departmentId, date } = req.query;
        if (!tenantId || !departmentId || !date) return res.status(400).json({ error: "Missing parameters" });
        const forecast = await TimeAIService.generateScheduleForecast(tenantId as string, departmentId as string, date as string);
        res.json(forecast);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/ai/risk-scan", async (req, res) => {
    try {
        const { tenantId, personId } = req.query;
        if (!tenantId || !personId) return res.status(400).json({ error: "Missing parameters" });
        const anomaly = await TimeAIService.predictFatigueRisk(tenantId as string, personId as string);
        res.json(anomaly || { status: "SAFE" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

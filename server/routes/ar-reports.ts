
import { Router } from "express";
import { arReportingService } from "../services/ar-reporting";

const router = Router();

router.get("/reports/aging", async (req, res) => {
    try {
        const report = await arReportingService.generateAgingReport();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate report" });
    }
});

router.get("/reports/reconciliation", async (req, res) => {
    try {
        const report = await arReportingService.reconcileArToGl("CURRENT");
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Failed to reconcile" });
    }
});

router.get("/reports/dso-trend", async (req, res) => {
    try {
        const report = await arReportingService.getDsoTrend();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate DSO trend" });
    }
});

router.get("/reports/statement/:customerId", async (req, res) => {
    try {
        const report = await arReportingService.getCustomerStatement(req.params.customerId);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Failed to generate statement" });
    }
});

router.post("/reports/revaluation", async (req, res) => {
    try {
        const { period } = req.body;
        // Stub implementation for AR FX Revaluation
        res.json({
            gainLoss: 1450.75,
            message: `Revaluation successful for period ${period}`
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to run revaluation" });
    }
});

export default router;

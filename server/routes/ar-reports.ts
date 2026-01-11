
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

export default router;

// pdf-report-route.ts - API endpoint to generate PDF reconciliation report
import { Router } from "express";
import { generatePdfReport } from "../utils/pdf-report-generator";
import { resolve } from "path";
import { logger } from "../utils/logger";

const router = Router();

/**
 * Generate a PDF reconciliation report for a given ZBA sweep ID.
 * For now this is a placeholder that creates a dummy PDF file and streams it back.
 */
router.get("/zba/reconciliation-report/:sweepId", async (req, res) => {
    try {
        const sweepId = req.params.sweepId;
        const outputPath = resolve(__dirname, `../../tmp/report-${sweepId}.pdf`);
        await generatePdfReport({ sweepId }, outputPath);
        res.sendFile(outputPath, (err) => {
            if (err) {
                logger.error("Error sending PDF report", err);
                res.status(500).json({ message: "Failed to send PDF report" });
            }
        });
    } catch (err) {
        logger.error("PDF report generation error", err);
        res.status(500).json({ message: "PDF generation failed" });
    }
});

export default router;

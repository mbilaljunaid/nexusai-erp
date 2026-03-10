/**
 * PDF Download Routes
 * Mounted at /api/pdf
 */

import { Router, Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';

const router = Router();

// GET /api/pdf/invoice/:id
router.get('/invoice/:id', async (req: Request, res: Response) => {
    try {
        const buffer = await pdfService.generateInvoicePdf(req.params.id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${req.params.id}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/pdf/payslip/:employeeId/:period
router.get('/payslip/:employeeId/:period', async (req: Request, res: Response) => {
    try {
        const buffer = await pdfService.generatePayslipPdf(req.params.employeeId, req.params.period);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="payslip-${req.params.employeeId}-${req.params.period}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/pdf/gl-report   body: { ledgerId, periodName }
router.post('/gl-report', async (req: Request, res: Response) => {
    try {
        const { ledgerId, periodName } = req.body;
        if (!ledgerId || !periodName) {
            return res.status(400).json({ error: 'ledgerId and periodName are required' });
        }
        const buffer = await pdfService.generateGlReportPdf(ledgerId, periodName);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="gl-report-${periodName}.pdf"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

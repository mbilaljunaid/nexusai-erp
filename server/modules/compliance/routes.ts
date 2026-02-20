// @ts-nocheck
import { Express } from "express";
import { eInvoiceService } from "./einvoice.service";
import { whtService } from "./wht.service";
import { taxGLReconService } from "./tax-gl-recon.service";

export function registerComplianceRoutes(app: Express) {

    // ─── E-Invoicing (COMP-OG-01) ─────────────────────────────────────────────

    /** Submit an e-invoice to a tax authority */
    app.post("/api/compliance/einvoices/submit", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const createdBy = (req.user as any)?.id || "system";
            const result = await eInvoiceService.submitInvoice({ ...req.body, tenantId, createdBy });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Cancel an e-invoice */
    app.post("/api/compliance/einvoices/:id/cancel", async (req, res) => {
        try {
            const result = await eInvoiceService.cancelInvoice(req.params.id, req.body.reason);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Get a single e-invoice document */
    app.get("/api/compliance/einvoices/:id", async (req, res) => {
        try {
            const doc = await eInvoiceService.getDocument(req.params.id);
            if (!doc) return res.status(404).json({ error: "Not found" });
            res.json(doc);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** List e-invoice documents (filterable by status / standard) */
    app.get("/api/compliance/einvoices", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const { status, standard, periodStart } = req.query as Record<string, string>;
            const docs = await eInvoiceService.listDocuments(tenantId, { status, standard, periodStart });
            res.json(docs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Stats pivot: standard × status → count */
    app.get("/api/compliance/einvoices/stats", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const stats = await eInvoiceService.getStats(tenantId);
            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ─── WHT (COMP-OG-02) ────────────────────────────────────────────────────

    /** Create or update a WHT rule */
    app.post("/api/compliance/wht/rules", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const rule = await whtService.createRule({ ...req.body, tenantId });
            res.status(201).json(rule);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** List WHT rules (optionally filtered by country) */
    app.get("/api/compliance/wht/rules", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const rules = await whtService.getRules(tenantId, req.query.countryCode as string);
            res.json(rules);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /**
     * Calculate WHT on a payment (called from AP payment flow).
     * Returns whtAmount and netAmount — AP service adjusts payment accordingly.
     */
    app.post("/api/compliance/wht/calculate", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const result = await whtService.calculateAndRecord({ ...req.body, tenantId });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** List WHT transactions for a period */
    app.get("/api/compliance/wht/transactions", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const { period, countryCode } = req.query as Record<string, string>;
            if (!period) return res.status(400).json({ error: "period required" });
            const txns = await whtService.listTransactions(tenantId, period, countryCode);
            res.json(txns);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Create a remittance batch for period + country */
    app.post("/api/compliance/wht/batches", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const createdBy = (req.user as any)?.id || "system";
            const batch = await whtService.createRemittanceBatch({ ...req.body, tenantId, createdBy });
            res.status(201).json(batch);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** List remittance batches */
    app.get("/api/compliance/wht/batches", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const batches = await whtService.listBatches(tenantId);
            res.json(batches);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Mark a remittance batch as filed */
    app.post("/api/compliance/wht/batches/:id/file", async (req, res) => {
        try {
            const result = await whtService.markBatchFiled(req.params.id, req.body.paymentRef);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ─── Tax-GL Recon (COMP-OG-03) ───────────────────────────────────────────

    /** Run a full tax-GL reconciliation */
    app.post("/api/compliance/tax-gl-recon/run", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const runBy = (req.user as any)?.id || "system";
            const result = await taxGLReconService.runRecon({ ...req.body, tenantId, runBy });
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** List recon runs */
    app.get("/api/compliance/tax-gl-recon/runs", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const runs = await taxGLReconService.listRuns(tenantId, req.query.periodName as string);
            res.json(runs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Get lines for a recon run */
    app.get("/api/compliance/tax-gl-recon/runs/:runId/lines", async (req, res) => {
        try {
            const lines = await taxGLReconService.getRunLines(req.params.runId);
            res.json(lines);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    /** Mark a recon line as disputed */
    app.post("/api/compliance/tax-gl-recon/lines/:lineId/dispute", async (req, res) => {
        try {
            const result = await taxGLReconService.markLineDisputed(req.params.lineId, req.body.notes);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    // ─── Compliance Controls ──────────────────────────────────────────────────

    app.post("/api/compliance/controls", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || "default-tenant";
            const control = await taxGLReconService.upsertComplianceControl({ ...req.body, tenantId });
            res.status(201).json(control);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/api/compliance/controls", async (req, res) => {
        try {
            const tenantId = (req.user as any)?.tenantId || (req.query.tenantId as string);
            const controls = await taxGLReconService.listComplianceControls(tenantId, req.query.periodName as string);
            res.json(controls);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/api/compliance/controls/:id/complete", async (req, res) => {
        try {
            const result = await taxGLReconService.completeControl(req.params.id, req.body.evidenceUrl);
            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
}

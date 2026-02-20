// @ts-nocheck
import { Express } from "express";

export function registerRecruitingRoutes(app: Express) {
    const tid = (req: any) => req.user?.tenantId || req.query?.tenantId || "default-tenant";

    // ─── EEO Compliance ───────────────────────────────────────────────────────
    app.post("/api/recruiting/eeo/record", async (req, res) => {
        try { const { eeoComplianceService: s } = await import("./eeo-compliance.service"); res.status(201).json(await s.recordApplicantData({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/eeo/advance", async (req, res) => {
        try { const { eeoComplianceService: s } = await import("./eeo-compliance.service"); res.json(await s.advanceStage(req.body.applicantId, tid(req), req.body.stage, req.body.outcome)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/eeo/report", async (req, res) => {
        try { const { eeoComplianceService: s } = await import("./eeo-compliance.service"); res.json(await s.generateEEO1Report(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/eeo/dispersion", async (req, res) => {
        try { const { eeoComplianceService: s } = await import("./eeo-compliance.service"); res.json(await s.getDispersionAnalysis(tid(req), req.query.period as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/eeo/periods", async (req, res) => {
        try { const { eeoComplianceService: s } = await import("./eeo-compliance.service"); res.json(await s.getPeriods(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── E-Signature ──────────────────────────────────────────────────────────
    app.post("/api/recruiting/esignature/documents", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.status(201).json(await s.createDocument({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/esignature/documents/:id/send", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.sendForSignature(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/esignature/documents/:id/open", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.markOpened(req.params.id, req.ip, req.headers['user-agent'])); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/esignature/documents/:id/sign", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.signDocument(req.params.id, req.body.signatureData, req.ip)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/esignature/documents/:id/decline", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.declineDocument(req.params.id, req.body.reason)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/esignature/documents", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.listDocuments(tid(req), req.query.applicantId as string, req.query.status as string, req.query.docType as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/esignature/documents/:id", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.getDocument(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/esignature/documents/:id/audit", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.getAuditTrail(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/esignature/summary", async (req, res) => {
        try { const { eSignatureService: s } = await import("./esignature.service"); res.json(await s.getSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Background Checks ────────────────────────────────────────────────────
    app.post("/api/recruiting/bgc/orders", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.status(201).json(await s.initiateCheck({ ...req.body, tenantId: tid(req) })); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/bgc/orders/:id/consent", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.recordConsent(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/bgc/orders/:id/component", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.updateComponent(req.params.id, req.body.componentType, req.body.result, req.body.details)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/bgc/orders/:id/adverse", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.initiateAdverseAction(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.post("/api/recruiting/bgc/orders/:id/decision", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.finalizeDecision(req.params.id, req.body.decision, req.body.decidedBy, req.body.notes)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/bgc/orders", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.listOrders(tid(req), req.query.applicantId as string, req.query.status as string)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/bgc/orders/:id", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.getOrderDetail(req.params.id)); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
    app.get("/api/recruiting/bgc/summary", async (req, res) => {
        try { const { backgroundCheckService: s } = await import("./background-check.service"); res.json(await s.getSummary(tid(req))); } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}

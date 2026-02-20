// @ts-nocheck
import { Express } from "express";

export function registerSupplierRoutes(app: Express) {

    // ─── Contract Obligations ─────────────────────────────────────────────────
    app.post("/api/supplier/obligations", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await contractObligationService.createObligation({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/obligations", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await contractObligationService.listObligations(tenantId, req.query.supplierId as string, req.query.status as string, req.query.contractId as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/obligations/summary", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await contractObligationService.getSummary(tenantId, req.query.supplierId as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/obligations/upcoming", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await contractObligationService.getUpcoming(tenantId, Number(req.query.days) || 30));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/obligations/:id/evidence", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            res.json(await contractObligationService.submitEvidence(req.params.id, req.body.evidenceUrl, req.body.notes));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/obligations/:id/review", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            res.json(await contractObligationService.review(req.params.id, req.body.decision, req.body.reviewedBy, req.body.notes));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/obligations/:id/escalate", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            res.json(await contractObligationService.escalate(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/obligations/process-overdue", async (req, res) => {
        try {
            const { contractObligationService } = await import("./contract-obligation.service");
            const tenantId = (req as any).user?.tenantId || req.body.tenantId || "default-tenant";
            res.json(await contractObligationService.processOverdue(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Certifications ───────────────────────────────────────────────────────
    app.post("/api/supplier/certifications", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await supplierCertificationService.addCertification({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/certifications", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierCertificationService.listCertifications(tenantId, req.query.supplierId as string, req.query.status as string, req.query.certType as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/certifications/portfolio", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierCertificationService.getCertificatePortfolio(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/certifications/expiring", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierCertificationService.getExpiringAlerts(tenantId, Number(req.query.days) || 60));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/certifications/:id/verify", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            res.json(await supplierCertificationService.verifyCertification(req.params.id, req.body.verifiedBy));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/certifications/:id/revoke", async (req, res) => {
        try {
            const { supplierCertificationService } = await import("./supplier-certification.service");
            res.json(await supplierCertificationService.revokeCertification(req.params.id, req.body.reason));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    // ─── Qualifications ───────────────────────────────────────────────────────
    app.post("/api/supplier/qualification-templates", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await supplierQualificationService.createTemplate({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/qualification-templates", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierQualificationService.listTemplates(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            const tenantId = (req as any).user?.tenantId || "default-tenant";
            res.status(201).json(await supplierQualificationService.startQualification({ ...req.body, tenantId }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/qualifications", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierQualificationService.listQualifications(tenantId, req.query.supplierId as string, req.query.status as string));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/qualifications/summary", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            const tenantId = (req as any).user?.tenantId || (req.query.tenantId as string) || "default-tenant";
            res.json(await supplierQualificationService.getSummary(tenantId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.get("/api/supplier/qualifications/:id", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.getQualificationDetail(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.patch("/api/supplier/qualifications/:id/responses", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.saveResponses(req.params.id, req.body.responses));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications/:id/submit", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.submit(req.params.id));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications/:id/begin-review", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.beginReview(req.params.id, req.body.reviewerId));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications/:id/approve", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.approve({ qualificationId: req.params.id, ...req.body }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications/:id/reject", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.json(await supplierQualificationService.reject(req.params.id, req.body.reviewerId, req.body.notes));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });

    app.post("/api/supplier/qualifications/:id/documents", async (req, res) => {
        try {
            const { supplierQualificationService } = await import("./supplier-qualification.service");
            res.status(201).json(await supplierQualificationService.addDocument({ qualificationId: req.params.id, ...req.body }));
        } catch (e: any) { res.status(500).json({ error: e.message }); }
    });
}

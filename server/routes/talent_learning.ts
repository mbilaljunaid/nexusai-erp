import { Router } from "express";
import { LearningService } from "../services/LearningService";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { hrmLearningCourses } from "@shared/schema/talent_learning";
import PDFDocument from "pdfkit";

const router = Router();

// COURSES CATALOG
router.get("/learning/courses", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const query = req.query.q as string;
        const category = req.query.category as string;
        const provider = req.query.provider as string;

        const courses = await LearningService.searchCatalog(tenantId, { query, category, provider });
        res.json(courses);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/courses", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const course = await LearningService.createCourse(data);
        res.status(201).json(course);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// OFFERINGS
router.get("/learning/courses/:id/offerings", async (req, res) => {
    try {
        const offerings = await LearningService.getOfferings(req.params.id);
        res.json(offerings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/offerings", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const offering = await LearningService.createOffering(data);
        res.status(201).json(offering);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ENROLLMENTS
router.get("/learning/my-enrollments", async (req, res) => {
    try {
        const userId = (req as any).user?.id || req.query.personId; // Dev fallback
        if (!userId) return res.status(400).json({ error: "User context required" });

        const enrollments = await LearningService.getMyLearning(userId);
        res.json(enrollments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/enroll", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        // User enrolls themselves or admin enrolls someone
        const personId = (req as any).user?.id || req.body.personId;

        const data = {
            tenantId,
            personId,
            offeringId: req.body.offeringId,
            status: "ENROLLED",
            progressPercent: 0
        };

        const enrollment = await LearningService.enroll(data);
        res.status(201).json(enrollment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// CONTENT ITEMS
router.get("/learning/content-items", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const items = await LearningService.listContentItems(tenantId);
        res.json(items);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/content-items", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const item = await LearningService.createContentItem(data);
        res.status(201).json(item);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// CERTIFICATIONS
router.get("/learning/certifications", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const certs = await LearningService.listCertifications(tenantId);
        res.json(certs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/certifications", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const cert = await LearningService.createCertification(data);
        res.status(201).json(cert);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GENERATE CERTIFICATE
router.get("/learning/enrollments/:id/certificate", async (req, res) => {
    try {
        const enrollment = await LearningService.getEnrollmentDetails(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ error: "Enrollment not found" });
        }

        // In real world, check status === COMPLETED
        // if (enrollment.status !== 'COMPLETED') ...

        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
        });

        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate-${enrollment.courseTitle.replace(/\s+/g, '_')}.pdf`);

        doc.pipe(res);

        // Certificate Border
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).stroke();

        // Content
        doc.font('Helvetica-Bold').fontSize(30).text('CERTIFICATE OF COMPLETION', 0, 100, { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica').fontSize(15).text('This is to certify that', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(25).text('NexusAI User', { align: 'center' }); // Replace with actual name if available

        doc.moveDown();
        doc.font('Helvetica').fontSize(15).text('has successfully completed the course', { align: 'center' });

        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(20).text(enrollment.courseTitle, { align: 'center' });

        doc.moveDown();
        doc.fontSize(12).text(`Completed on: ${enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleDateString() : new Date().toLocaleDateString()}`, { align: 'center' });

        doc.moveDown(2);
        doc.fontSize(10).text('NexusAI Learning Management System', { align: 'center' });

        doc.end();

    } catch (err: any) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
});

export default router;

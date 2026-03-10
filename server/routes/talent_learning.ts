import { Router } from "express";
import { LearningService } from "../services/LearningService";
import { db } from "../db";
import { eq, desc, and, sql } from "drizzle-orm";
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
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;
        const entLegalEntityId = req.headers['x-legal-entity-id'] || req.query.legalEntityId as string;

        const result = await LearningService.searchCatalog(tenantId, { query, category, provider, page, pageSize, entLegalEntityId });
        res.json(result);
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
        let personId = (req as any).user?.id || req.body.personId;
        const entLegalEntityId = req.headers['x-legal-entity-id'] || req.body.entLegalEntityId as string;

        if (personId === "current_user" || !personId) {
            const { hrPersons } = await import("@shared/schema/hr_worker");
            const [firstPerson] = await db.select({ id: hrPersons.id }).from(hrPersons).limit(1);
            if (firstPerson) {
                personId = firstPerson.id;
            }
        }

        const data = {
            tenantId,
            personId,
            offeringId: req.body.offeringId,
            status: req.body.status || "ENROLLED",
            progressPercent: 0,
            entLegalEntityId
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

// MANAGER SERVICES
import { ManagerLearningService } from "../services/ManagerLearningService";

router.get("/learning/manager/team", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const managerId = (req as any).user?.id || req.query.managerId; // Dev fallback

        if (!managerId) return res.status(400).json({ error: "Manager Context Required" });

        const team = await ManagerLearningService.getTeamMembers(managerId, tenantId);
        res.json(team);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/manager/assign", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const managerId = (req as any).user?.id || req.body.managerId; // Dev fallback

        const { personId, offeringId } = req.body;

        const enrollment = await ManagerLearningService.assignLearning(managerId, {
            personId,
            offeringId,
            tenantId
        });

        res.json(enrollment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// AI SERVICES
import { LearningAI } from "../services/LearningAI";

router.get("/learning/recommendations", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const personId = (req as any).user?.id;

        if (!personId) return res.status(400).json({ error: "User Context Required" });

        const recs = await LearningAI.getRecommendations(personId, tenantId);
        res.json(recs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/ai/extract-skills", async (req, res) => {
    try {
        const { text } = req.body;
        const skills = await LearningAI.extractSkills(text);
        res.json({ skills });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// CONTENT DELIVERY (PLAYER)
import { ContentDeliveryService } from "../services/ContentDeliveryService";

router.get("/learning/player/:enrollmentId/launch", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const userId = (req as any).user?.id; // In real app, this comes from auth middleware
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const launchData = await ContentDeliveryService.getLaunchData(req.params.enrollmentId, tenantId, userId);
        res.json(launchData);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/player/:enrollmentId/progress", async (req, res) => {
    try {
        const result = await ContentDeliveryService.trackProgress(req.params.enrollmentId, req.body);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// DEEP COMPLIANCE
import { RecertificationService } from "../services/RecertificationService";
import { hrmLearningAuditLogs } from "@shared/schema/talent_learning";

router.post("/learning/admin/compliance/run-check", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const result = await RecertificationService.checkExpirations(tenantId);
        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/learning/admin/audit-logs", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const logs = await db.select().from(hrmLearningAuditLogs)
            .where(eq(hrmLearningAuditLogs.tenantId, tenantId))
            .orderBy(desc(hrmLearningAuditLogs.createdAt))
            .limit(50);
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// WORKFLOW & APPROVALS
import { LearningWorkflowService } from "../services/LearningWorkflowService";

router.post("/learning/enrollments/:id/request-approval", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const userId = (req as any).user?.id || (req.body.userId); // Allow passing for testing
        const result = await LearningWorkflowService.requestApproval(req.params.id, userId, tenantId);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/learning/approvals/:requestId/decide", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const approverId = (req as any).user?.id || (req.body.approverId);
        const { decision, comments } = req.body; // APPROVE or REJECT

        const result = await LearningWorkflowService.decideRequest(req.params.requestId, approverId, decision, comments, tenantId);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================
// LEARNING PATHS (Phase 9)
// ============================================
// Note: Dynamic import wrapper inside handlers if top-level fails or direct if supported.
// Using direct import since we're in same module context.
import { LearningPathService } from "../services/LearningPathService";

// Create Curriculum
router.post("/learning/curricula", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const curriculum = await LearningPathService.createCurriculum({ ...req.body, tenantId });
        res.json(curriculum);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// List Curricula
router.get("/learning/curricula", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const list = await LearningPathService.listCurricula(tenantId);
        res.json(list);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Details
router.get("/learning/curricula/:id", async (req, res) => {
    try {
        const details = await LearningPathService.getCurriculumDetails(req.params.id);
        if (!details) return res.status(404).json({ error: "Curriculum not found" });
        res.json(details);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add Course
router.post("/learning/curricula/:id/courses", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const { courseId, sequence } = req.body;
        const result = await LearningPathService.addCourse(tenantId, req.params.id, courseId, sequence);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================
// ASSESSMENTS (Phase 10)
// ============================================
import { AssessmentService } from "../services/AssessmentService";

// Create Assessment
router.post("/learning/assessments", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const assessment = await AssessmentService.createAssessment({ ...req.body, tenantId });
        res.json(assessment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Add Question
router.post("/learning/assessments/:id/questions", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const question = await AssessmentService.addQuestion({ ...req.body, assessmentId: req.params.id, tenantId });
        res.json(question);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Details
router.get("/learning/assessments/:id", async (req, res) => {
    try {
        const details = await AssessmentService.getAssessment(req.params.id);
        if (!details) return res.status(404).json({ error: "Assessment not found" });
        res.json(details);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Submit Attempt
router.post("/learning/assessments/:id/submit", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const { enrollmentId, answers } = req.body;
        const result = await AssessmentService.submitAttempt(tenantId, enrollmentId, req.params.id, answers);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// ============================================
// COMMUNITIES (Phase 11)
// ============================================
import { CommunityService } from "../services/CommunityService";

// Create Community
router.post("/learning/communities", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const community = await CommunityService.createCommunity({ ...req.body, tenantId });
        res.json(community);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// List Roots
router.get("/learning/communities/roots", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const roots = await CommunityService.getRootCommunities(tenantId);
        res.json(roots);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Children & Courses
router.get("/learning/communities/:id/children", async (req, res) => {
    try {
        const result = await CommunityService.getChildren(req.params.id);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Breadcrumbs
router.get("/learning/communities/:id/breadcrumbs", async (req, res) => {
    try {
        const bc = await CommunityService.getBreadcrumbs(req.params.id);
        res.json(bc);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

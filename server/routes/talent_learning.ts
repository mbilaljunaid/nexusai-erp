import { Router } from "express";
import { LearningService } from "../services/LearningService";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { hrmLearningCourses } from "@shared/schema/talent_learning";

const router = Router();

// COURSES CATALOG
router.get("/learning/courses", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const query = req.query.q as string;
        const courses = await LearningService.searchCatalog(tenantId, query);
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

export default router;

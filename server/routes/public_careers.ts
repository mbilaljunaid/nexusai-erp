
import { Router } from "express";
import { RecruitmentService } from "../services/RecruitmentService";
import { ResumeParsingService } from "../services/ResumeParsingService";
import { db } from "../db";
import { hrmRecApplications, hrmRecCandidates } from "../../shared/schema/talent_recruitment";
import { eq, and } from "drizzle-orm";

const router = Router();

// Get Public Jobs
router.get("/public/jobs", async (req, res) => {
    try {
        // Return only Open jobs
        // Assuming we default to 'default_tenant' for public site or use subdomain in real app
        const tenantId = "default_tenant";
        const jobs = await RecruitmentService.getRequisitions(tenantId, { limit: 100, offset: 0 });
        // Filter for 'OPEN' status if not already done by service (Service currently returns all)
        // We really should filter in Service, but for V1 we do CLIENT/Route side
        const openJobs = jobs.filter((j: any) => j.status === 'OPEN');
        res.json(openJobs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Job
router.get("/public/jobs/:id", async (req, res) => {
    try {
        const jobs = await RecruitmentService.getRequisitions("default_tenant", { limit: 1000, offset: 0 });
        const job = jobs.find((j: any) => j.id === req.params.id);
        if (!job) return res.status(404).json({ error: "Job not found" });
        res.json(job);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Apply to Job
router.post("/public/apply", async (req, res) => {
    try {
        const { requisitionId, firstName, lastName, email, resumeText } = req.body;
        const tenantId = "default_tenant";

        // 1. Create/Find Candidate
        // Check if email exists
        let candidateId;
        const existingCandidate = await RecruitmentService.getCandidates(tenantId, { limit: 1, offset: 0, maskPII: false });
        // Note: getCandidates doesn't filter by email naturally, need raw query or improved service.
        // For V1, let's just CREATE via Service (it should handle, or we duplicate).
        // RecruitmentService.createCandidate handles basic insert.

        // Helper: simplistic email check
        const [existing] = await db.select().from(hrmRecCandidates)
            .where(and(eq(hrmRecCandidates.email, email), eq(hrmRecCandidates.tenantId, tenantId)));

        if (existing) {
            candidateId = existing.id;
        } else {
            // Parse Resume First to get Skills
            const parsedData = await ResumeParsingService.parseResume(resumeText || "");
            const newCandidate = await RecruitmentService.createCandidate({
                tenantId,
                firstName,
                lastName,
                email,
                phone: req.body.phone,
                skills: parsedData.skills,
                resumeUrl: "mock_url_s3" // Would be upload result
            });
            candidateId = newCandidate.id;
        }

        // 2. Create Application
        const app = await RecruitmentService.applyForJob({
            tenantId,
            requisitionId,
            candidateId,
            status: "NEW"
        });

        // 3. AI Scoring
        const score = await ResumeParsingService.scoreCandidate(candidateId, requisitionId);

        // Update App with Score
        await db.update(hrmRecApplications)
            .set({ score: score })
            .where(eq(hrmRecApplications.id, app.id));

        res.status(201).json({ ...app, score });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

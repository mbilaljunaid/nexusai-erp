import { Router } from "express";
import { ProfileService } from "../services/ProfileService";

const router = Router();

// COMPETENCIES
router.get("/talent/competencies", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const comps = await ProfileService.getCompetencies(tenantId);
        res.json(comps);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/talent/competencies", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const data = { ...req.body, tenantId };
        const comp = await ProfileService.createCompetency(data);
        res.status(201).json(comp);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PERSON SKILLS
router.get("/talent/profile/:personId/skills", async (req, res) => {
    try {
        const skills = await ProfileService.getPersonSkills(req.params.personId);
        res.json(skills);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/talent/profile/skills", async (req, res) => {
    try {
        const tenantId = (req as any).user?.tenantId || "default_tenant";
        const personId = (req as any).user?.id || req.body.personId;

        const data = { ...req.body, tenantId, personId };
        const skill = await ProfileService.addSkill(data);
        res.status(201).json(skill);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/talent/profile/skills/:id", async (req, res) => {
    try {
        await ProfileService.removeSkill(req.params.id);
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

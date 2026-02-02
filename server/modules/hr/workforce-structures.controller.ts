import { Request, Response } from "express";
import { WorkforceStructuresService } from "./services/WorkforceStructuresService";

// Locations
async function listLocations(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const locations = await WorkforceStructuresService.listLocations(tenantId);
        res.json(locations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function createLocation(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const location = await WorkforceStructuresService.createLocation(req.body, tenantId);
        res.json(location);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// Organizations
async function listOrganizations(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const classification = req.query.classification as string | undefined;
        const orgs = await WorkforceStructuresService.listOrganizations(tenantId, classification);
        res.json(orgs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function createOrganization(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const org = await WorkforceStructuresService.createOrganization(req.body, tenantId);
        res.json(org);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// Jobs
async function listJobs(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const jobs = await WorkforceStructuresService.listJobs(tenantId);
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function createJob(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const job = await WorkforceStructuresService.createJob(req.body, tenantId);
        res.json(job);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// Grades
async function listGrades(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const grades = await WorkforceStructuresService.listGrades(tenantId);
        res.json(grades);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function createGrade(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const grade = await WorkforceStructuresService.createGrade(req.body, tenantId);
        res.json(grade);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// Positions
async function listPositions(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const positions = await WorkforceStructuresService.listPositions(tenantId);
        res.json(positions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function createPosition(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const position = await WorkforceStructuresService.createPosition(req.body, tenantId);
        res.json(position);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const workforceStructuresController = {
    listLocations,
    createLocation,
    listOrganizations,
    createOrganization,
    listJobs,
    createJob,
    listGrades,
    createGrade,
    listPositions,
    createPosition
};

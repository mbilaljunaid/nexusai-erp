import { Request, Response } from "express";
import { PersonService } from "./services/PersonService";

async function searchPersons(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const query = req.query.q as string | undefined;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const result = await PersonService.searchPersons(tenantId, query, page, limit);
        res.json(result);
    } catch (error: any) {
        console.error("Error searching persons:", error);
        res.status(500).json({ message: error.message });
    }
}

async function getPersonProfile(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const personId = req.params.id;

        const profile = await PersonService.getPersonProfile(personId, tenantId);
        if (!profile) {
            return res.status(404).json({ message: "Person not found" });
        }
        res.json(profile);
    } catch (error: any) {
        console.error("Error fetching person profile:", error);
        res.status(500).json({ message: error.message });
    }
}

async function hireWorker(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const actorId = (req as any).user?.id || (req as any).user?.username || "system"; // Robust fallback
        const data = req.body;

        const result = await PersonService.hireWorker(data, tenantId, actorId);
        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error hiring worker:", error);
        res.status(500).json({ message: error.message });
    }
}

async function terminateWorker(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const actorId = (req as any).user?.id || (req as any).user?.username || "system";
        const personId = req.params.id;
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ message: "Termination date is required" });
        }

        const result = await PersonService.terminateWorker({
            personId,
            terminationDate: date,
            reason
        }, tenantId, actorId);

        res.json(result);
    } catch (error: any) {
        console.error("Error terminating worker:", error);
        res.status(500).json({ message: error.message });
    }
}

async function transferWorker(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const actorId = (req as any).user?.id || (req as any).user?.username || "system";
        const personId = req.params.id;
        const data = req.body;

        if (!data.effectiveDate) {
            return res.status(400).json({ message: "Effective date is required" });
        }

        const result = await PersonService.transferWorker({
            personId,
            ...data
        }, tenantId, actorId);

        res.json(result);
    } catch (error: any) {
        console.error("Error transferring worker:", error);
        res.status(500).json({ message: error.message });
    }
}

async function getRecentTransactions(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

        const transactions = await PersonService.getRecentTransactions(tenantId, limit);
        res.json(transactions);
    } catch (error: any) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: error.message });
    }
}

async function getPeopleAnalytics(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const analytics = await PersonService.getPeopleAnalytics(tenantId);
        res.json(analytics);
    } catch (error: any) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: error.message });
    }
}

export const personController = {
    searchPersons,
    getPersonProfile,
    hireWorker,
    terminateWorker,
    transferWorker,
    getRecentTransactions,
    getPeopleAnalytics
};

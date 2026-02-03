import { Request, Response } from "express";
import { ComplianceService } from "./services/ComplianceService";
import { ComplianceAnalyticsService } from "./services/ComplianceAnalyticsService";
import { ComplianceRiskService } from "./services/ComplianceRiskService";

export async function listRules(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const rules = await ComplianceService.listRules(tenantId);
        res.json(rules);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function createRule(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const rule = await ComplianceService.createRule(req.body, tenantId);
        res.status(201).json(rule);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function deleteRule(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const success = await ComplianceService.deleteRule(req.params.id, tenantId);
        if (!success) {
            return res.status(404).json({ message: "Rule not found" });
        }
        res.status(204).end();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function getAnalytics(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const [metrics, riskDistribution, violationTrends] = await Promise.all([
            ComplianceAnalyticsService.getSummaryMetrics(tenantId),
            ComplianceAnalyticsService.getRiskDistribution(tenantId),
            ComplianceAnalyticsService.getViolationTrends(tenantId)
        ]);
        res.json({ metrics, riskDistribution, violationTrends });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function listViolations(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const violations = await ComplianceService.listViolations(tenantId);
        res.json(violations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function updateViolation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const tenantId = (req as any).user?.tenantId || "default";
        const updated = await ComplianceService.updateViolation(id, tenantId, req.body);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const complianceController = {
    listRules,
    createRule,
    deleteRule,
    getAnalytics,
    listViolations,
    updateViolation,
    predictRisk
};

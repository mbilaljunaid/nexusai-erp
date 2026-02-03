import { Request, Response } from "express";
import { ComplianceService } from "./services/ComplianceService";
import { ComplianceAnalyticsService } from "./services/ComplianceAnalyticsService";
import { ComplianceRiskService } from "./services/ComplianceRiskService";
import { ComplianceApprovalService } from "./services/ComplianceApprovalService";

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
        const userId = (req as any).user?.id;
        const [metrics, riskDistribution, violationTrends, readiness, auditSummary] = await Promise.all([
            ComplianceAnalyticsService.getSummaryMetrics(tenantId, userId),
            ComplianceAnalyticsService.getRiskDistribution(tenantId),
            ComplianceAnalyticsService.getViolationTrends(tenantId, userId),
            ComplianceAnalyticsService.getRegulatoryReadinessScore(tenantId),
            ComplianceAnalyticsService.getAuditEngagementSummary(tenantId)
        ]);
        res.json({ metrics, riskDistribution, violationTrends, readiness, auditSummary });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function listViolations(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const userId = (req as any).user?.id;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const result = await ComplianceService.listViolations(tenantId, userId, page, limit);
        res.json(result);
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

export async function predictRisk(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const { transactionType, data } = req.body;
        const result = await ComplianceRiskService.predictRisk(tenantId, transactionType, data);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function requestRemediationApproval(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const userId = (req as any).user?.id;
        const { violationId, approvers } = req.body;
        const approval = await ComplianceApprovalService.requestRemediationApproval({
            tenantId,
            violationId,
            requesterId: userId,
            approvers
        });
        res.status(201).json(approval);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function approveRemediation(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const userId = (req as any).user?.id;
        const { approvalId } = req.params;
        const updated = await ComplianceApprovalService.approveRemediation(approvalId, userId, tenantId);
        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function listApprovals(req: Request, res: Response) {
    try {
        const tenantId = (req as any).user?.tenantId || "default";
        const { violationId } = req.query;
        if (!violationId) return res.status(400).json({ message: "violationId is required" });

        const approvals = await ComplianceApprovalService.listApprovals(violationId as string, tenantId);
        res.json(approvals);
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
    predictRisk,
    requestRemediationApproval,
    approveRemediation,
    listApprovals
};

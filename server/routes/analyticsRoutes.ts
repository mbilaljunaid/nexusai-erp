/**
 * Analytics Routes - Phase 5 Integration
 * Endpoints for form, workflow, and GL analytics
 */

import { Router } from "express";
import { analyticsEngine } from "../analytics/analyticsEngine";

const router = Router();

/**
 * POST /api/analytics/submissions
 * Record form submission for analytics
 */
router.post("/analytics/submissions", (req, res) => {
  try {
    const { formId, data, status, processingTime } = req.body;
    if (!formId || !status) {
      return res.status(400).json({ error: "formId and status are required" });
    }
    analyticsEngine.recordSubmission(formId, data, status, processingTime);
    res.json({ recorded: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/workflows
 * Record workflow event for analytics
 */
router.post("/analytics/workflows", (req, res) => {
  try {
    const { formId, event } = req.body;
    if (!formId || !event) {
      return res.status(400).json({ error: "formId and event are required" });
    }
    analyticsEngine.recordWorkflowEvent(formId, event);
    res.json({ recorded: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/gl
 * Record GL entry for analytics
 */
router.post("/analytics/gl", (req, res) => {
  try {
    const entry = req.body;
    if (!entry || !entry.account) {
      return res.status(400).json({ error: "GL entry with account is required" });
    }
    analyticsEngine.recordGLEntry(entry);
    res.json({ recorded: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/forms/:formId
 * Get form submission analytics
 */
router.get("/analytics/forms/:formId", (req, res) => {
  try {
    const analytics = analyticsEngine.getFormAnalytics(req.params.formId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/workflows/:formId
 * Get workflow analytics
 */
router.get("/analytics/workflows/:formId", (req, res) => {
  try {
    const analytics = analyticsEngine.getWorkflowAnalytics(req.params.formId);
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/gl
 * Get GL analytics for date range
 */
router.get("/analytics/gl", (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    const analytics = analyticsEngine.getGLAnalytics(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/hr-predictive
 * Get HR Predictive Analytics data
 */
router.get("/analytics/hr-predictive", (req, res) => {
  try {
    const { months } = req.query;
    res.json({
      attritionRisk: [
        { employeeId: 'E001', employeeName: 'Alice Chen', department: 'Engineering', riskScore: 85, riskFactors: ['No promotion in 3 years', 'Salary below market', 'Low engagement score'], tenure: 4, lastReview: '2025-12-01' },
        { employeeId: 'E002', employeeName: 'Bob Martinez', department: 'Sales', riskScore: 72, riskFactors: ['Missed targets', 'Manager change'], tenure: 2, lastReview: '2026-01-15' },
        { employeeId: 'E003', employeeName: 'Carol Davis', department: 'Engineering', riskScore: 68, riskFactors: ['Low engagement', 'Heavy workload'], tenure: 3, lastReview: '2026-01-20' },
        { employeeId: 'E004', employeeName: 'David Kim', department: 'Product', riskScore: 55, riskFactors: ['No recent training'], tenure: 5, lastReview: '2026-02-01' },
        { employeeId: 'E005', employeeName: 'Emma Wilson', department: 'Marketing', riskScore: 45, riskFactors: ['Remote work request denied'], tenure: 1, lastReview: '2026-01-10' }
      ],
      skillGaps: [
        { skill: 'Cloud Architecture', currentCount: 5, requiredCount: 12, gap: 7, priority: 'High' },
        { skill: 'Machine Learning', currentCount: 3, requiredCount: 8, gap: 5, priority: 'High' },
        { skill: 'Product Management', currentCount: 4, requiredCount: 8, gap: 4, priority: 'Medium' },
        { skill: 'Data Science', currentCount: 6, requiredCount: 9, gap: 3, priority: 'Medium' },
        { skill: 'UX Design', currentCount: 8, requiredCount: 10, gap: 2, priority: 'Low' }
      ],
      talentTrends: [
        { month: 'Sep', hires: 12, departures: 5, netChange: 7 },
        { month: 'Oct', hires: 15, departures: 6, netChange: 9 },
        { month: 'Nov', hires: 10, departures: 8, netChange: 2 },
        { month: 'Dec', hires: 8, departures: 12, netChange: -4 },
        { month: 'Jan', hires: 18, departures: 7, netChange: 11 },
        { month: 'Feb', hires: 14, departures: 9, netChange: 5 }
      ],
      summary: {
        avgAttritionRisk: 65,
        highRiskCount: 3,
        criticalSkillGaps: 2,
        projectedAttrition: 15
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

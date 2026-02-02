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

export default router;
